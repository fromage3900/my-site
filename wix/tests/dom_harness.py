"""
Zero-dependency HTML5 DOM Parser & CSS AST Query Engine for Wix Portfolio E2E Testing.
Built using standard library html.parser.HTMLParser and re.
"""

from html.parser import HTMLParser
import re
from typing import List, Dict, Optional, Union, Any


class HTMLNode:
    """Represents an HTML DOM node tree element."""

    def __init__(self, tag: str, attributes: Optional[Dict[str, str]] = None, parent: Optional['HTMLNode'] = None):
        self.tag: str = tag.lower() if tag else ""
        self.attributes: Dict[str, str] = attributes if attributes is not None else {}
        self.children: List[Union['HTMLNode', str]] = []
        self.parent: Optional['HTMLNode'] = parent

    @property
    def classes(self) -> List[str]:
        """Returns list of class names from class attribute."""
        cls_str = self.attributes.get('class', '')
        return [c.strip() for c in cls_str.split() if c.strip()]

    @property
    def text_content(self) -> str:
        """Returns normalized recursive inner text content."""
        texts = []
        def _collect(n: 'HTMLNode'):
            for child in n.children:
                if isinstance(child, str):
                    texts.append(child)
                elif isinstance(child, HTMLNode):
                    _collect(child)
        _collect(self)
        return ' '.join(' '.join(texts).split())

    @property
    def raw_text(self) -> str:
        """Returns raw un-normalized recursive inner text content."""
        texts = []
        def _collect(n: 'HTMLNode'):
            for child in n.children:
                if isinstance(child, str):
                    texts.append(child)
                elif isinstance(child, HTMLNode):
                    _collect(child)
        _collect(self)
        return "".join(texts)

    def get_attribute(self, name: str, default: Optional[str] = None) -> Optional[str]:
        """Get attribute value by name (case-insensitive lookup)."""
        name_lower = name.lower()
        for k, v in self.attributes.items():
            if k.lower() == name_lower:
                return v
        return default

    def has_attribute(self, name: str) -> bool:
        """Check if attribute exists on node."""
        name_lower = name.lower()
        return any(k.lower() == name_lower for k in self.attributes.keys())

    def _matches_single_token(self, token: str) -> bool:
        """Check if this node matches a single CSS selector token (e.g. 'section.hero#main[data-attr="val"]:first-child')."""
        if not token or token == '*':
            return True

        # Extract pseudo class if any
        pseudo = None
        if ':' in token and not ('[' in token and token.find(':') > token.find('[')):
            parts = token.rsplit(':', 1)
            token_base = parts[0]
            pseudo = parts[1]
        else:
            token_base = token

        # Handle pseudo classes
        if pseudo:
            if pseudo == 'first-child':
                if self.parent:
                    siblings = [c for c in self.parent.children if isinstance(c, HTMLNode)]
                    if not siblings or siblings[0] != self:
                        return False
            elif pseudo == 'last-child':
                if self.parent:
                    siblings = [c for c in self.parent.children if isinstance(c, HTMLNode)]
                    if not siblings or siblings[-1] != self:
                        return False
            elif pseudo.startswith('nth-child(') and pseudo.endswith(')'):
                idx_str = pseudo[10:-1].strip()
                if idx_str.isdigit():
                    idx = int(idx_str)
                    if self.parent:
                        siblings = [c for c in self.parent.children if isinstance(c, HTMLNode)]
                        if idx <= 0 or idx > len(siblings) or siblings[idx - 1] != self:
                            return False

        # Extract attributes [attr] or [attr=val] or [attr*=val]
        attrs_to_check = []
        attr_matches = re.findall(r'\[([\w-]+)(?:([~|^$*]?=)["\']?([^\]"\']*)["\']?)?\]', token_base)
        for attr_name, op, val in attr_matches:
            attrs_to_check.append((attr_name, op, val))

        # Remove attribute selectors from token_base for tag/id/class parsing
        clean_token = re.sub(r'\[[^\]]+\]', '', token_base)

        # Parse tag, id, classes
        tag_name = None
        id_val = None
        classes_to_check = []

        # Find id
        if '#' in clean_token:
            parts = clean_token.split('#', 1)
            clean_token = parts[0]
            id_and_classes = parts[1]
            if '.' in id_and_classes:
                id_parts = id_and_classes.split('.')
                id_val = id_parts[0]
                classes_to_check.extend(id_parts[1:])
            else:
                id_val = id_and_classes
        
        # Find classes
        if '.' in clean_token:
            parts = clean_token.split('.')
            if parts[0]:
                tag_name = parts[0]
            classes_to_check.extend(parts[1:])
        elif clean_token:
            tag_name = clean_token

        # Check tag name
        if tag_name and tag_name != '*':
            if self.tag != tag_name.lower():
                return False

        # Check id
        if id_val:
            if self.get_attribute('id') != id_val:
                return False

        # Check classes
        if classes_to_check:
            node_classes = self.classes
            for c in classes_to_check:
                if c not in node_classes:
                    return False

        # Check attributes
        for attr_name, op, val in attrs_to_check:
            attr_val = self.get_attribute(attr_name)
            if attr_val is None:
                return False
            if op:
                if op == '=' and attr_val != val:
                    return False
                elif op == '*=' and val not in attr_val:
                    return False
                elif op == '~=' and val not in attr_val.split():
                    return False
                elif op == '^=' and not attr_val.startswith(val):
                    return False
                elif op == '$=' and not attr_val.endswith(val):
                    return False

        return True

    def find_all(self, selector: str) -> List['HTMLNode']:
        """
        Find all descendant nodes (or self) matching CSS selector.
        Supports comma-separated selectors and space-separated descendant combinators.
        """
        results = []

        # Handle comma-separated selectors
        sub_selectors = [s.strip() for s in selector.split(',') if s.strip()]
        for sub_sel in sub_selectors:
            matched = self._find_all_single_selector(sub_sel)
            for m in matched:
                if m not in results:
                    results.append(m)

        return results

    def _find_all_single_selector(self, selector: str) -> List['HTMLNode']:
        tokens = [t.strip() for t in selector.split() if t.strip()]
        if not tokens:
            return []

        # Recursively search for matching chain
        matched_nodes: List['HTMLNode'] = []

        def _search_chain(current_nodes: List['HTMLNode'], token_idx: int):
            if token_idx >= len(tokens):
                for n in current_nodes:
                    if n not in matched_nodes:
                        matched_nodes.append(n)
                return

            current_token = tokens[token_idx]
            next_candidates = []

            for parent_node in current_nodes:
                # Search all descendants of parent_node matching current_token
                descendants = parent_node._get_all_descendants()
                for d in descendants:
                    if d._matches_single_token(current_token):
                        next_candidates.append(d)

            if next_candidates:
                _search_chain(next_candidates, token_idx + 1)

        # Start search from self
        initial_candidates = []
        if self._matches_single_token(tokens[0]):
            initial_candidates.append(self)
        
        # Also include all descendants matching tokens[0]
        for d in self._get_all_descendants():
            if d._matches_single_token(tokens[0]):
                initial_candidates.append(d)

        if len(tokens) == 1:
            return initial_candidates

        # If multi-token, evaluate remaining tokens
        _search_chain(initial_candidates, 1)
        return matched_nodes

    def _get_all_descendants(self) -> List['HTMLNode']:
        descendants = []
        def _collect(n: 'HTMLNode'):
            for c in n.children:
                if isinstance(c, HTMLNode):
                    descendants.append(c)
                    _collect(c)
        _collect(self)
        return descendants

    def find_one(self, selector: str) -> Optional['HTMLNode']:
        """Find first matching node or None."""
        matches = self.find_all(selector)
        return matches[0] if matches else None


class DOMParser(HTMLParser):
    """HTML5 DOM Parser building HTMLNode tree."""

    VOID_TAGS = {
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr'
    }

    def __init__(self):
        super().__init__()
        self.root = HTMLNode(tag='#document')
        self.current_node = self.root
        self.stack: List[HTMLNode] = [self.root]

    def handle_starttag(self, tag: str, attrs: List[tuple]):
        attr_dict = {k: (v if v is not None else "") for k, v in attrs}
        node = HTMLNode(tag=tag, attributes=attr_dict, parent=self.current_node)
        self.current_node.children.append(node)

        if tag.lower() not in self.VOID_TAGS:
            self.current_node = node
            self.stack.append(node)

    def handle_endtag(self, tag: str):
        tag_lower = tag.lower()
        if tag_lower in self.VOID_TAGS:
            return

        # Pop stack until tag matches
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag_lower:
                self.stack = self.stack[:i]
                self.current_node = self.stack[-1]
                break

    def handle_data(self, data: str):
        if data and self.current_node:
            self.current_node.children.append(data)


class HTMLDocument:
    """Wrapper around HTML DOM tree with query shortcuts."""

    def __init__(self, html_content: str):
        self.raw_html: str = html_content
        parser = DOMParser()
        parser.feed(html_content)
        self.root = parser.root

        # Find main html or body node if present
        html_nodes = self.root.find_all('html')
        self.html_node = html_nodes[0] if html_nodes else self.root

    def find_all(self, selector: str) -> List[HTMLNode]:
        return self.html_node.find_all(selector)

    def find_one(self, selector: str) -> Optional[HTMLNode]:
        return self.html_node.find_one(selector)

    def get_attribute(self, name: str, default: Optional[str] = None) -> Optional[str]:
        return self.html_node.get_attribute(name, default)

    @property
    def title(self) -> str:
        title_node = self.find_one('title')
        return title_node.text_content if title_node else ""

    @property
    def body(self) -> Optional[HTMLNode]:
        return self.find_one('body')


class CSSDocument:
    """Lightweight CSS AST indexing rulesets, container queries, clamp font props, and root variables."""

    def __init__(self, css_content: str):
        self.raw_css = css_content
        self.root_tokens: Dict[str, str] = {}
        self.container_queries: List[Dict[str, Any]] = []
        self.clamp_properties: List[Dict[str, str]] = []
        self.rules: List[Dict[str, Any]] = []

        self._parse(css_content)

    def _parse(self, content: str):
        # Strip comments
        clean_css = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)

        # Parse :root tokens
        root_blocks = re.findall(r':root\s*\{([^}]+)\}', clean_css)
        for block in root_blocks:
            for match in re.finditer(r'(--[\w-]+)\s*:\s*([^;]+);', block):
                self.root_tokens[match.group(1).strip()] = match.group(2).strip()

        # Parse @container query definitions
        container_matches = re.finditer(r'@container\s+([^{]+)\{([^}]+(?:\}\s*\})?)', clean_css)
        for match in container_matches:
            condition = match.group(1).strip()
            body = match.group(2).strip()
            self.container_queries.append({'condition': condition, 'body': body})

        # Parse clamp() properties
        clamp_matches = re.finditer(r'([\w-]+)\s*:\s*([^;]*clamp\([^;]+\)[^;]*);', clean_css)
        for match in clamp_matches:
            self.clamp_properties.append({
                'property': match.group(1).strip(),
                'value': match.group(2).strip()
            })

        # Parse generic rulesets
        rule_matches = re.finditer(r'([^{@]+)\{([^}]+)\}', clean_css)
        for match in rule_matches:
            selector_raw = match.group(1).strip()
            decls_raw = match.group(2).strip()

            selectors = [s.strip() for s in selector_raw.split(',') if s.strip()]
            decls = {}
            for decl in decls_raw.split(';'):
                if ':' in decl:
                    prop, val = decl.split(':', 1)
                    decls[prop.strip()] = val.strip()

            if selectors and decls:
                self.rules.append({
                    'selectors': selectors,
                    'declarations': decls
                })

    def get_variable(self, name: str, default: Optional[str] = None) -> Optional[str]:
        """Lookup CSS :root token value."""
        if not name.startswith('--'):
            name = f'--{name}'
        return self.root_tokens.get(name, default)

    def find_rules(self, selector_substring: str) -> List[Dict[str, Any]]:
        """Find rulesets matching selector substring."""
        matched = []
        for r in self.rules:
            if any(selector_substring in sel for sel in r['selectors']):
                matched.append(r)
        return matched

    def has_rule(self, selector_substring: str) -> bool:
        """Check if any rule contains selector substring."""
        return len(self.find_rules(selector_substring)) > 0
