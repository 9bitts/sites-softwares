# 9bitts Softwares & Sites — Site institucional

Site estático (HTML/CSS/JS puro, sem build) com visual dark/tech: fundo animado de partículas em canvas, glassmorphism, animações de scroll com GSAP e cursor customizado.

## Estrutura

```
index.html        página única (hero, sobre, serviços, portfólio, processo, contato)
css/style.css      todo o estilo
js/main.js         cursor, menu mobile, animações de scroll, contadores e fundo de partículas
```

Sem dependência de Node/build. GSAP é carregado via CDN. Basta abrir `index.html` no navegador para pré-visualizar.

## Pré-visualizar localmente

Dando duplo clique no `index.html` já funciona. Se preferir um servidor local (recomendado para evitar bloqueios de CORS em alguns navegadores):

```powershell
cd "C:\Users\diego\Claude\Projects\9bitts Softwares & Sites"
python -m http.server 8000
# abrir http://localhost:8000
```

## Colocar no GitHub — passo a passo do zero

### 1. Criar conta e repositório no GitHub
1. Crie uma conta em [github.com](https://github.com) (se ainda não tiver).
2. Clique em **New repository** (botão verde, ou `+` no canto superior direito → *New repository*).
3. Dê um nome, por exemplo `9bitts-site`.
4. Deixe como **Public** (ou Private, se preferir).
5. **Não** marque a opção de criar README, .gitignore ou licença — deixe o repositório totalmente vazio.
6. Clique em **Create repository**. O GitHub vai mostrar uma URL parecida com:
   `https://github.com/SEU-USUARIO/9bitts-site.git`

### 2. Instalar o Git (se ainda não tiver)
Baixe em [git-scm.com/download/win](https://git-scm.com/download/win) e instale com as opções padrão.

### 3. Enviar os arquivos (rodar no PowerShell, dentro da pasta do projeto)

```powershell
cd "C:\Users\diego\Claude\Projects\9bitts Softwares & Sites"
git init
git add .
git commit -m "Primeira versão do site institucional 9bitts"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/9bitts-site.git
git push -u origin main
```

Na primeira vez, o Git vai pedir para você fazer login no GitHub pelo navegador — só autorizar.

### 4. Colocar o site no ar (deploy)

Depois do push, qualquer uma dessas opções publica o site gratuitamente e te dá um link para testar antes de escolher o domínio final:

- **Vercel** (recomendado, mais rápido para trocar de domínio depois): [vercel.com](https://vercel.com) → *Add New Project* → conectar o GitHub → selecionar o repositório `9bitts-site` → Deploy. Nenhuma configuração extra é necessária (não há build step).
- **Netlify**: [netlify.com](https://netlify.com) → *Add new site* → *Import an existing project* → GitHub → selecionar o repositório.
- **GitHub Pages**: no repositório, ir em *Settings* → *Pages* → em *Branch* selecionar `main` → *Save*. O site fica disponível em `https://SEU-USUARIO.github.io/9bitts-site/`.

Qualquer uma delas permite conectar um domínio próprio depois, quando você decidir o link.

## Próximas edições

- Trocar `mailto:contato@9bitts.com` e o link do WhatsApp (`https://wa.me/55...`) pelos seus contatos reais antes de publicar.
- Substituir textos e números conforme novos projetos forem fechados.
