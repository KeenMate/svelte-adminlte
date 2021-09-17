import { makeHtmlAttributes } from "@rollup/plugin-html";

const defaultTemplate = async ({
  attributes,
  files,
  meta,
  publicPath,
  title
}) => {
  console.log("Public path", publicPath);

  const scripts = (files.js || [])
    .map(({ fileName }) => {
      const attrs = makeHtmlAttributes(attributes.script);
      return `<script src="${publicPath}${fileName}"${attrs}></script>`;
    })
    .join('\n');

  const links = (files.css || [])
    .map(({ fileName }) => {
      const attrs = makeHtmlAttributes(attributes.link);
      return `<link href="${publicPath}${fileName}" rel="stylesheet"${attrs}>`;
    })
    .join('\n');

  const metas = meta
    .map((input) => {
      const attrs = makeHtmlAttributes(input);
      return `<meta${attrs}>`;
    })
    .join('\n');

  return `
<!doctype html>
<html${makeHtmlAttributes(attributes.html)}>
  <head>
    ${metas}
    <title>${title}</title>

    <link rel="stylesheet" href="/css/fontawesome-all.min.css">
    <link rel="stylesheet" href="/css/select2.min.css">
    <link rel="stylesheet" href="/css/select2-bootstrap4.min.css">
    <link rel="stylesheet" href="/css/daterangepicker.min.css">
    <link rel="stylesheet" href="/css/icheck-bootstrap.min.css">
    <link rel="stylesheet" href="/css/adminlte.min.css">

    ${links}
  </head>
  <body class="sidebar-mini">
  	<div id="app"></div>

    
    <!-- jQuery -->
    <script src="/js/jquery.min.js"></script>
    <!-- jQuery UI 1.11.4 -->
    <script src="/js/jquery-ui.min.js"></script>
    <!-- Resolve conflict in jQuery UI tooltip with Bootstrap tooltip -->
    <script>
      $.widget.bridge('uibutton', $.ui.button)
    </script>
    <!-- Bootstrap 4 -->
    <script src="/js/bootstrap.bundle.min.js"></script>
    <script src="/js/select2.full.min.js"></script>
    <script src="/js/moment-with-locales.min.js"></script>
    <script src="/js/daterangepicker.min.js"></script>

    <script defer src="/js/adminlte.min.js"></script>
    ${scripts}
  </body>
</html>`;
};

export default defaultTemplate;