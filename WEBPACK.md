# Webpack Configuration for Gira Site

Este projeto agora utiliza Webpack para compilar, minificar e otimizar CSS e JavaScript para produção.

## 📦 Instalação

As dependências já foram instaladas. Se precisar reinstalar, execute:

```bash
npm install
```

## 🚀 Comandos disponíveis

### Development (com live reload)
```bash
npm run dev
```
Inicia o servidor de desenvolvimento em `http://localhost:8080` com hot module reloading.

### Production Build
```bash
npm run build
```
Compila e minifica o projeto para a pasta `dist/`. Os arquivos serão otimizados:
- **CSS**: Minificado com cssnano (remove comentários, comprime propriedades)
- **JavaScript**: Minificado com Terser (remove código morto, comprime variáveis)
- **HTML**: Minificado (remove comentários e espaços em branco)
- **Assets**: Copiados para `dist/assets/`

## 📁 Estrutura de saída

Após rodar `npm run build`, a pasta `dist/` conterá:

```
dist/
├── index.html              (HTML minificado)
├── css/
│   └── main.min.css       (CSS minificado)
├── js/
│   └── main.min.js        (JavaScript minificado)
└── assets/                 (Imagens e mídia)
    └── images/
```

## ⚙️ Configurações

- **webpack.config.js**: Configuração principal do Webpack
- **postcss.config.js**: Configuração do PostCSS para minificação de CSS

## 🔍 O que é minificado?

### CSS (`css/main.min.css`)
- Remove comentários
- Comprime propriedades CSS
- Remove código duplicado

### JavaScript (`js/main.min.js`)
- Remove comentários
- Comprime nomes de variáveis
- Remove código não utilizado
- Mantém a funcionalidade completa

## 📊 Tamanho dos arquivos

- **style.css original**: ~56 KB
- **main.min.css (minificado)**: ~15 KB (73% menor)
- **script.js original**: ~3.7 KB
- **main.min.js (minificado)**: ~2.2 KB (40% menor)

## 🚀 Deploy

Para fazer deploy, copie o conteúdo da pasta `dist/` para seu servidor web.

## ⚠️ Notas

- A pasta `dist/` é recriada a cada build (configurada com `clean: true`)
- As imagens são grandes (total ~31 MB) - considere otimizá-las com compressão
- O projeto usa ES5+ com suporte a browsers modernos
- Todos os assets são versionados automaticamente pelo Webpack

## 📝 Próximos passos

Considerações para otimizações futuras:
1. Otimizar imagens com `image-webpack-loader`
2. Implementar lazy loading para imagens abaixo da linha de dobra
3. Adicionar service worker para PWA
4. Implementar code splitting se o JavaScript crescer
5. Adicionar análise de bundle com `webpack-bundle-analyzer`
