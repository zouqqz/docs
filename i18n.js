/**
 * 三三云文档 · 界面文案本地化
 * ------------------------------------------------------------
 * 背景：右侧目录标题由 Mintlify 内置渲染，固定为英文 "On this page"。
 * 方案：本文件被 Mintlify 自动注入每个页面（content 目录 .js 自动包含），
 *       渲染后把目录标题文案替换为「目录」，图标与点击回顶行为不受影响。
 * 定位：优先用官方布局 hook [data-layout-item="toc-title"] 精确命中标题；
 *       旧版本回退到 #table-of-contents / [data-layout-item="toc"] 容器内查找。
 * 兜底：SPA 路由切换会重新渲染目录标题，用 MutationObserver 监听后自动重新替换。
 */
(function () {
  if (window.__SS_I18N__) return;
  window.__SS_I18N__ = true;

  var EN = "On this page";
  var ZH = "目录";

  /* 在元素子树内查找包含英文文案的文本节点并替换，返回是否发生替换 */
  function localize(el) {
    var replaced = false;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].nodeValue.indexOf(EN) !== -1) {
        nodes[i].nodeValue = nodes[i].nodeValue.split(EN).join(ZH);
        replaced = true;
      }
    }
    return replaced;
  }

  /* 定位目录标题并替换：优先标题 hook，失败则退回容器级替换 */
  function fix() {
    var title = document.querySelector('[data-layout-item="toc-title"]');
    if (title) return localize(title);
    var toc =
      document.getElementById("table-of-contents") ||
      document.querySelector(
        '[data-layout-item="toc"], [data-layout-item="toc-content"]'
      );
    return toc ? localize(toc) : false;
  }

  function boot() {
    fix();
    /* 只在目录面板范围内监听重渲染，避免全页 observer 的性能开销 */
    var root =
      document.getElementById("table-of-contents") ||
      document.querySelector(
        '[data-layout-item="toc"], [data-layout-item="toc-content"], [data-layout-item="side-panel"]'
      );
    if (root && !window.__SS_I18N_OBS__) {
      window.__SS_I18N_OBS__ = true;
      new MutationObserver(function () {
        fix();
      }).observe(root, { childList: true, subtree: true, characterData: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  document.addEventListener("mintlify:navigate", boot);
})();
