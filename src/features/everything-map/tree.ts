import type { TocItem, TocNode } from "./types";

function compareIdParts(a: string[], b: string[]): number {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const ai = Number(a[i] ?? 0);
    const bi = Number(b[i] ?? 0);
    if (ai !== bi) return ai - bi;
  }
  return 0;
}

export function buildTree(items: TocItem[]): TocNode[] {
  const nodes: TocNode[] = items.map((item) => ({ ...item, children: [] }));
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const roots: TocNode[] = [];

  nodes.forEach((node) => {
    const parts = node.id.split(".");
    if (parts.length === 1) {
      roots.push(node);
      return;
    }
    const parentId = parts.slice(0, -1).join(".");
    const parent = byId.get(parentId);
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortRecursive = (list: TocNode[]) => {
    list.sort((a, b) => compareIdParts(a.id.split("."), b.id.split(".")));
    list.forEach((child) => sortRecursive(child.children));
  };
  sortRecursive(roots);
  return roots;
}

export function findNode(tree: TocNode[], id: string): TocNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    const child = findNode(node.children, id);
    if (child) return child;
  }
  return null;
}

export function filterTreeByQuery(tree: TocNode[], q: string): TocNode[] {
  if (!q.trim()) return tree;
  const query = q.toLowerCase();

  const walk = (nodes: TocNode[]): TocNode[] => {
    const result: TocNode[] = [];
    for (const node of nodes) {
      const matches = `${node.id} ${node.title}`.toLowerCase().includes(query);
      const filteredChildren = walk(node.children);
      if (matches || filteredChildren.length > 0) {
        result.push({ ...node, children: filteredChildren });
      }
    }
    return result;
  };

  return walk(tree);
}
