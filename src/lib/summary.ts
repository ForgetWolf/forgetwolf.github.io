export function manualSummary(desc?: string): string {
  // 无desc时摘要留空
  return desc ?? '';
}

// 自动摘要备用，当前不调用；保留旧实现以便对照：
// (body ?? '').replace(/```[\s\S]*?```/g, '').replace(/[#*_~`]/g, '').trim().slice(0, 160);
//
// 改进参考：移除围栏代码、图片、链接目标、HTML 及引用定义，并按字素
// 截断，避免拆开 Emoji。这里只处理常见 Markdown；若以后启用并要求完整
// 支持 Markdown，应改用语法树提取纯文本，而不是继续扩展正则。
// export function automaticSummary(body: string, limit = 160): string {
//   const plain = body
//     .replace(/^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1\s*$/gm, '')
//     .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
//     .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
//     .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
//     .replace(/^\s*\[[^\]]+\]:.*$/gm, '')
//     .replace(/<[^>]*>/g, '')
//     .replace(/[#*_~`>]/g, '')
//     .replace(/\s+/g, ' ').trim();
//   const segments = new Intl.Segmenter('zh', { granularity: 'grapheme' });
//   return Array.from(segments.segment(plain), item => item.segment)
//     .slice(0, limit).join('');
// }
