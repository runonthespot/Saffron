const Markdown = ({ children }) => children;
Markdown.defaultProps = {
  children: '',
};

module.exports = {
  __esModule: true,
  default: Markdown,
  defaultUrlTransform: (url) => url,
}; 