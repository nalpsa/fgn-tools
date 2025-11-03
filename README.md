🛠️ FGN Tools - Extensão VS Code

Uma poderosa caixa de ferramentas de desenvolvimento para Visual Studio Code, projetada para aumentar a produtividade de desenvolvedores com utilitários essenciais para manipulação de código, texto e arquivos.
📋 Índice

    Visão Geral

    Funcionalidades

    Ferramentas Implementadas

    Estrutura do Projeto

    Instalação e Desenvolvimento

    Uso

    Arquitetura Técnica

    Roadmap

🎯 Visão Geral

FGN Tools é uma extensão para VS Code que reúne múltiplas ferramentas de desenvolvimento em uma interface unificada e intuitiva. A extensão oferece um dashboard centralizado onde os usuários podem acessar diversas utilidades organizadas por categorias.
✨ Funcionalidades
🎛️ Dashboard Centralizado

    Interface visual organizada por categorias

    Acesso rápido a todas as ferramentas

    Design responsivo que se integra ao tema do VS Code

    Navegação intuitiva entre ferramentas

📂 Organização por Categorias

    💻 Ferramentas de Código: Manipulação e análise de código fonte

    📝 Ferramentas de Texto: Processamento e transformação de texto

    📁 Ferramentas de Arquivo: Operações com arquivos e diretórios

    🎨 Formatadores: Formatação e beautification de código

    🔧 Outras Ferramentas: Utilitários diversos

🛠️ Ferramentas Implementadas
💻 Ferramentas de Código
1. Analisador de Complexidade Ciclomática 🔄

    Descrição: Analisa a complexidade ciclomática do código para identificar funções complexas

    Funcionalidades:

        Calcula métricas de complexidade

        Destaca funções com alta complexidade

        Sugere refatorações

        Suporte para múltiplas linguagens

2. Extrator de Dependências 📦

    Descrição: Identifica e extrai dependências e imports do código

    Funcionalidades:

        Lista todas as dependências

        Detecta dependências não utilizadas

        Exporta lista em formatos variados

3. Gerador de Diagramas de Classe 📊

    Descrição: Gera diagramas UML a partir do código fonte

    Funcionalidades:

        Suporte para TypeScript/JavaScript, Java, C#

        Export para PlantUML, Mermaid

        Visualização integrada

📝 Ferramentas de Texto
4. Transformador de Case 🅰️

    Descrição: Converte texto entre diferentes casos (camelCase, PascalCase, snake_case, etc.)

    Funcionalidades:

        Suporte para 8 tipos de case diferentes

        Conversão em lote

        Preview antes de aplicar

5. Gerador de Lorem Ipsum 📄

    Descrição: Gera texto placeholder para prototipação

    Funcionalidades:

        Quantidade customizável de parágrafos/palavras

        Múltiplos formatos de saída

        Copiar para clipboard

6. Contador de Caracteres/Palavras 🔢

    Descrição: Analisa texto e fornece estatísticas detalhadas

    Funcionalidades:

        Contagem de caracteres, palavras, linhas

        Análise de densidade de palavras

        Estatísticas de leitura

📁 Ferramentas de Arquivo
7. Comparador de Arquivos ⚖️

    Descrição: Compara dois arquivos ou trechos de código

    Funcionalidades:

        Diff visual side-by-side

        Highlight de diferenças

        Merge assistido

8. Validador de JSON/XML ✅

    Descrição: Valida e formata JSON e XML

    Funcionalidades:

        Validação de sintaxe

        Formatação/beautify

        Minificação

        Conversão JSON <> XML

9. Gerador de Hash/Checksum 🔐

    Descrição: Gera hashes MD5, SHA-1, SHA-256 para texto/arquivos

    Funcionalidades:

        Múltiplos algoritmos

        Verificação de integridade

        Comparação de hashes

🎨 Formatadores
10. Formatador de SQL 🗃️

    Descrição: Formata queries SQL para melhor legibilidade

    Funcionalidades:

        Indentação inteligente

        Highlight de keywords

        Compactação/expansão

11. Organizador de CSS 🎨

    Descrição: Organiza propriedades CSS seguindo metodologias

    Funcionalidades:

        Ordenação por categorias

        Suporte a CSS, SCSS, Less

        Regras customizáveis

12. Formatador de Markdown 📝

    Descrição: Formata e organiza documentos Markdown

    Funcionalidades:

        Tabelas de conteúdo automáticas

        Formatação consistente

        Preview integrado

🔧 Outras Ferramentas
13. Conversor de Base 🔢

    Descrição: Converte números entre bases (binário, decimal, hexadecimal, etc.)

    Funcionalidades:

        Suporte para 6 bases numéricas

        Conversão em lote

        Cálculos bitwise

14. Gerador de QR Code 📱

    Descrição: Gera códigos QR a partir de texto/URLs

    Funcionalidades:

        Customização de tamanho/cor

        Export para PNG/SVG

        Leitura de QR codes

15. Manipulador de Timestamp ⏰

    Descrição: Conversão entre formatos de data/hora

    Funcionalidades:

        Conversão timestamp ⇄ data legível

        Cálculos com datas

        Múltiplos formatos de saída

🏗️ Estrutura do Projeto
text

fgn-tools/
├── src/
│   ├── core/
│   │   ├── interfaces/
│   │   │   └── tool.interface.ts
│   │   └── services/
│   │       └── tool-manager.service.ts
│   ├── features/
│   │   └── toolbox/
│   │       └── toolbox.ui.service.ts
│   ├── tools/
│   │   ├── code-tools/
│   │   ├── text-tools/
│   │   ├── file-tools/
│   │   ├── formatters/
│   │   └── other-tools/
│   └── extension.ts
├── media/
├── out/
├── package.json
└── README.md

🚀 Instalação e Desenvolvimento
Pré-requisitos

    Node.js (v16 ou superior)

    Visual Studio Code

    Git

Configuração do Ambiente

    Clone o repositório

bash

git clone <repository-url>
cd fgn-tools

    Instale as dependências

bash

npm install

    Compile o projeto

bash

npm run compile

    Execute em modo desenvolvimento

bash

npm run watch

    Teste a extensão

    Pressione F5 no VS Code

    Abra uma nova janela de desenvolvimento

    Execute o comando FGN Tools: Open Dashboard

Comandos Disponíveis
bash

npm run compile          # Compila o TypeScript
npm run watch           # Compila em modo watch
npm run test            # Executa testes
npm run package         # Empacota a extensão
npm run vscode:prepublish  # Pré-publicação

🎮 Uso
Acesso Rápido

    Atalho de Teclado: Ctrl+Shift+P (Cmd+Shift+P no Mac)

    Digite: FGN Tools: Open Dashboard

    Selecione a ferramenta desejada no dashboard

Interface do Dashboard

    Layout: Grid responsivo com categorias

    Navegação: Click em qualquer card para abrir a ferramenta

    Modal: Cada ferramenta abre em painel lateral

🏛️ Arquitetura Técnica
Padrões de Design

    Service Pattern: Para gerenciamento de ferramentas

    Strategy Pattern: Para implementação de diferentes ferramentas

    Observer Pattern: Para comunicação com Webview

Tecnologias Utilizadas

    TypeScript: Linguagem principal

    VS Code API: Integração com editor

    Webview API: Interface de usuário

    HTML/CSS/JS: Frontend das ferramentas

Estrutura de Interfaces
typescript

interface ITool {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    activate: () => Promise<void>;
}

🗺️ Roadmap
Fase 1 - MVP ✅

    Estrutura base da extensão

    Sistema de gerenciamento de ferramentas

    Dashboard básico

    Interface de Webview

Fase 2 - Ferramentas Core 🚧

    Implementar 5 ferramentas principais

    Sistema de configurações

    Internacionalização (i18n)

    Sistema de temas

Fase 3 - Expansão 📈

    Todas as 15 ferramentas implementadas

    Sistema de plugins

    Integração com APIs externas

    Analytics de uso

Fase 4 - Otimização 🚀

    Performance improvements

    Testes automatizados

    Documentação completa

    Publicação no Marketplace

🤝 Contribuição
Como Contribuir

    Fork o projeto

    Crie uma branch para sua feature (git checkout -b feature/AmazingFeature)

    Commit suas mudanças (git commit -m 'Add some AmazingFeature')

    Push para a branch (git push origin feature/AmazingFeature)

    Abra um Pull Request

Guidelines

    Siga os padrões de código existentes

    Adicione testes para novas funcionalidades

    Atualize a documentação

    Use commits semânticos

📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo LICENSE para detalhes.
🐛 Reportar Bugs

Encontrou um bug? Por favor, abra uma issue no GitHub com:

    Descrição detalhada do problema

    Passos para reproduzir

    Comportamento esperado vs atual

    Screenshots (se aplicável)

💡 Sugestões

Tem ideias para novas ferramentas ou melhorias? Adoraríamos ouvir! Abra uma issue com a tag enhancement.

Desenvolvido com ❤️ para a comunidade de desenvolvedores

FGN Tools - Tornando o desenvolvimento mais eficiente, uma ferramenta de cada vez