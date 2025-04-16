# Sistema de Registro de Anormalidades

Sistema web para registro e acompanhamento de anormalidades, desenvolvido como parte do projeto SENAI.

## Funcionalidades

- Login e cadastro de usuários
- Registro de anormalidades com:
  - Captura de foto via câmera ou upload
  - Geração de QR Code
  - Envio de email com detalhes da anormalidade
- Interface responsiva e moderna
- Armazenamento local dos dados

## Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript
- EmailJS (para envio de emails)
- QRCode.js (para geração de QR Codes)

## Configuração

1. Clone o repositório
2. Configure o EmailJS:
   - Crie uma conta em https://www.emailjs.com/
   - Crie um template de email
   - Substitua as chaves no arquivo `registro.html`:
     - `SUA_PUBLIC_KEY`
     - `YOUR_SERVICE_ID`
     - `YOUR_TEMPLATE_ID`

## Estrutura do Projeto

```
.
├── login.html          # Página de login
├── cadastro.html       # Página de cadastro
├── registro.html       # Página de registro de anormalidades
├── css/
│   └── style.css       # Estilos principais
├── js/
│   ├── login.js        # Lógica de login
│   ├── cadastro.js     # Lógica de cadastro
│   └── registro.js     # Lógica de registro
└── README.md           # Este arquivo
```

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes. 