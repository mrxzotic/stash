function renderPanelCardColumns(items) {
  const columns = [[], []];
  items.forEach((item, index) => {
    columns[index % columns.length].push(renderPanelItem(item));
  });
  return columns.map(
    (columnItems, index) => `<div class="wp-item-column" data-panel-column="${index}">${columnItems.join("")}</div>`
  ).join("");
}

function reorderPanelItemsOnly(root) {
  const list = root.querySelector(".wp-items");
  if (!list) {
    return false;
  }

  if (panelState.brandCloudOpen && !panelState.brandFilterKey && !panelState.archivedOpen) {
    return reorderPanelBrandCloud(root, list);
  }

  const visibleItems = panelSortedItems(panelVisibleItems(panelState.items));
  if (!visibleItems.length) {
    return false;
  }

  const previousItemRects = capturePanelItemLayout(root);
  list.classList.add("is-reordering");
  const reordered = panelState.compactView
    ? reorderPanelCompactItems(list, visibleItems)
    : reorderPanelCardItems(list, visibleItems);

  if (!reordered) {
    list.classList.remove("is-reordering");
    return false;
  }

  animatePanelItemLayout(root, previousItemRects);
  finishPanelListReorder(list);
  return true;
}

function reorderPanelBrandCloud(root, list) {
  const visibleItems = panelVisibleItems(panelState.items);
  if (!visibleItems.length) {
    return false;
  }

  const previousItemRects = capturePanelItemLayout(root);
  list.classList.add("is-reordering");
  const reordered = reorderPanelBrandCloudItems(list, visibleItems);
  if (!reordered) {
    list.classList.remove("is-reordering");
    return false;
  }

  animatePanelItemLayout(root, previousItemRects);
  finishPanelListReorder(list);
  return true;
}

function finishPanelListReorder(list) {
  window.requestAnimationFrame(() => {
    list.classList.remove("is-reordering");
  });
}

function syncPanelItemsContent(root, list, visibleItems) {
  const mode = panelItemsRenderMode();
  const currentMode = panelCurrentItemsRenderMode(list);
  const previousItemRects = capturePanelItemLayout(root);
  list.classList.add("is-reordering");

  const synced = currentMode === mode && (
    mode === "brand-cloud"
      ? reorderPanelBrandCloudItems(list, panelVisibleItems(panelState.items))
      : syncPanelItemNodes(list, visibleItems, mode)
  );

  if (!synced) {
    list.innerHTML = renderPanelItemsHtml(visibleItems);
  }

  bindImageFallbacks(root);
  animatePanelItemLayout(root, previousItemRects);
  finishPanelListReorder(list);
}

function panelItemsRenderMode() {
  if (panelState.brandCloudOpen && !panelState.brandFilterKey && !panelState.archivedOpen) {
    return "brand-cloud";
  }
  return panelState.compactView ? "compact" : "cards";
}

function panelCurrentItemsRenderMode(list) {
  if (list.querySelector(".wp-brand-cloud")) return "brand-cloud";
  if (list.querySelector(".wp-compact-list")) return "compact";
  if (list.querySelector("[data-panel-column]")) return "cards";
  return "";
}

function syncPanelItemNodes(list, visibleItems, mode) {
  if (!visibleItems.length) {
    list.innerHTML = renderPanelEmpty();
    return true;
  }

  return mode === "compact"
    ? syncPanelCompactItemNodes(list, visibleItems)
    : syncPanelCardItemNodes(list, visibleItems);
}

function syncPanelCompactItemNodes(list, visibleItems) {
  const compactList = list.querySelector(".wp-compact-list");
  if (!compactList) {
    return false;
  }

  syncPanelNodeOrder(compactList, panelItemNodesFor(list, visibleItems, "compact"));
  removePanelStaleItemNodes(compactList, visibleItems);
  return true;
}

function syncPanelCardItemNodes(list, visibleItems) {
  const columns = panelCardColumns(list);
  if (!columns) {
    return false;
  }

  syncPanelCardColumns(columns, panelItemNodesFor(list, visibleItems, "cards"));
  columns.forEach((column) => removePanelStaleItemNodes(column, visibleItems));
  return true;
}

function panelItemNodesFor(list, visibleItems, mode) {
  const nodeById = new Map(
    Array.from(list.querySelectorAll("[data-panel-item-id]"))
      .map((node) => [node.dataset.panelItemId, node])
  );

  return visibleItems.map((item, index) => {
    const node = nodeById.get(item.id);
    const signature = panelItemRenderSignature(item, mode);
    if (node?.dataset.panelRenderSignature === signature) {
      node.dataset.panelRenderSignature = signature;
      if (mode === "compact") syncPanelCompactItemNodeIndex(node, index);
      return node;
    }

    const nextNode = elementFromHtml(mode === "compact" ? renderPanelCompactItem(item, index) : renderPanelItem(item));
    nextNode.dataset.panelRenderSignature = signature;
    return nextNode;
  });
}

function removePanelStaleItemNodes(parent, visibleItems) {
  const visibleIds = new Set(visibleItems.map((item) => item.id));
  Array.from(parent.querySelectorAll("[data-panel-item-id]")).forEach((node) => {
    if (!visibleIds.has(node.dataset.panelItemId)) {
      node.remove();
    }
  });
}

function panelItemRenderSignature(item, mode) {
  const price = item.price || {};
  return [
    mode,
    item.id,
    isPanelItemArchived(item) ? "archived" : "active",
    panelItemIsShortlisted(item) ? "shortlist" : "",
    panelItemDecisionState(item),
    item.title,
    item.brand,
    item.category,
    price.amount,
    price.currency,
    price.rubAmount,
    price.compareAtAmount,
    (item.imageUrls || []).join("|"),
    item.imageUrl || ""
  ].join("::");
}

function reorderPanelCardItems(list, visibleItems) {
  const columns = panelCardColumns(list);
  if (!columns) {
    return false;
  }

  const nodes = panelCurrentItemNodes(list, visibleItems);
  if (!nodes) {
    return false;
  }

  syncPanelCardColumns(columns, nodes);
  return true;
}

function reorderPanelCompactItems(list, visibleItems) {
  const compactList = list.querySelector(".wp-compact-list");
  if (!compactList) {
    return false;
  }

  const nodes = panelCurrentItemNodes(list, visibleItems);
  if (!nodes) {
    return false;
  }

  nodes.forEach(syncPanelCompactItemNodeIndex);
  syncPanelNodeOrder(compactList, nodes);
  return true;
}

function syncPanelCompactItemNodeIndex(node, index) {
  const label = node?.querySelector?.(".wp-compact-index");
  if (label) label.textContent = String(index + 1);
}

function reorderPanelBrandCloudItems(list, visibleItems) {
  const cloud = list.querySelector(".wp-brand-cloud");
  if (!cloud) {
    return false;
  }

  cloud.classList.toggle("is-sort-list", panelState.brandCloudSortList);
  const brands = panelBrandCloudItems(visibleItems);
  const nodes = panelCurrentBrandNodes(cloud, brands);
  if (!nodes) {
    return false;
  }

  syncPanelNodeOrder(cloud, nodes);
  nodes.forEach((node, index) => {
    node.style.setProperty("--wp-brand-cloud-scale", brands[index].scale.toFixed(3));
  });
  return true;
}

function panelCurrentBrandNodes(cloud, brands) {
  const nodeByKey = new Map(
    Array.from(cloud.querySelectorAll("[data-brand-filter-key]"))
      .map((node) => [node.dataset.brandFilterKey, node])
  );
  if (nodeByKey.size !== brands.length) {
    return null;
  }

  const nodes = brands.map((brand) => nodeByKey.get(brand.key));
  return nodes.every(Boolean) ? nodes : null;
}

function panelCardColumns(list) {
  const columns = Array.from(list.querySelectorAll("[data-panel-column]"));
  return columns.length === 2 ? columns : null;
}

function syncPanelCardColumns(columns, nodes) {
  nodes.forEach((node, index) => {
    node.style.removeProperty("order");
    const column = columns[index % columns.length];
    const nextSibling = panelColumnNextSibling(column, node, Math.floor(index / columns.length));
    if (node.parentElement !== column || node.nextElementSibling !== nextSibling) {
      column.insertBefore(node, nextSibling);
    }
  });
}

function panelColumnNextSibling(column, movingNode, targetIndex) {
  const siblings = Array.from(column.querySelectorAll("[data-panel-item-id]"))
    .filter((node) => node !== movingNode);
  return siblings[targetIndex] || null;
}

function panelCurrentItemNodes(list, visibleItems) {
  const nodeById = new Map(
    Array.from(list.querySelectorAll("[data-panel-item-id]"))
      .map((node) => [node.dataset.panelItemId, node])
  );
  if (nodeById.size !== visibleItems.length) {
    return null;
  }

  const nodes = visibleItems.map((item) => nodeById.get(item.id));
  return nodes.every(Boolean) ? nodes : null;
}

function syncPanelNodeOrder(parent, nodes) {
  const ordered = new Set(nodes);
  nodes.forEach((node, index) => {
    node.style.order = String(index);
  });
  Array.from(parent.children).forEach((node) => {
    if (!ordered.has(node) && (node.dataset?.panelItemId || node.dataset?.brandFilterKey)) {
      node.style.removeProperty("order");
    }
  });
}
