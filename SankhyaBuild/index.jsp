<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="UTF-8" isELIgnored="false" %> <!DOCTYPE html PUBLIC
"-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd"> <%@ taglib prefix="snk" uri="/WEB-INF/tld/sankhyaUtil.tld" %> <%@ page import="br.com.sankhya.modelcore.util.EntityFacadeFactory" %><!doctype html>
<html lang="en">
<head>
<snk:load></snk:load> <script type="text/javascript" id="sankhyaVariable"> var
Params = {}; var base_path =`${BASE_FOLDER}\/`.replace("\\", "");
localStorage.setItem("base_folder", base_path); window.baseFolder = base_path;
window.resolveAsset = function(url)
{
    url = String(url); if (url[0] == ".") { url = url.slice(1, url.length); }
    if (url[0] == "/") { url = url.slice(1, url.length); } const base_folder =
    window.localStorage.getItem("base_folder"); const isJsFile =
    url.endsWith(".js"); if
    (!isJsFile &&
    base_folder){ const finalUrl = "./"+base_folder + url; return finalUrl; }
    if (base_folder)
    { const finalUrl = "./mge/" + base_folder + url; return finalUrl; } else
    { return url; }
}; window.dbDialect =
"<%=EntityFacadeFactory.getDWFFacade().getJdbcWrapper().getDataSource().getConnection().getMetaData().getDatabaseProductName()%>"
</script>
<script></script>
<meta charset="UTF-8"/>
<link rel="icon" type="image/svg+xml" href=${BASE_FOLDER}/vite.svg />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Vite + React</title>
<script type="module" crossorigin src="${BASE_FOLDER}/assets/index-C2bnFzPC.js"></script>
<link rel="stylesheet" crossorigin href="${BASE_FOLDER}/assets/index-DnnCLjmA.css">
</head>
<body>
<div id="root"></div>
</body>
</html>