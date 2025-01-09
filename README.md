# ObservAções

## Dependências
- Criar uma chave na [brapi.dev](https://brapi.dev) e colocá-la em API_KEY no .env
- Definir uma SECRET_KEY do .env para a aplicação. Pode ser [usado este site](https://djecrety.ir/).
- Configurar um email gmail para [utilizar o serviço SMTP](https://www.sitepoint.com/django-send-email/#h-setting-up-gmail-smtp-server-with-app-password) e definí-lo no .env (EMAIL_HOST_USER e EMAIL_HOST_PASSWORD)
- Definir uma JWT_SCERET do .env. Pode ser definida utilizando [este site](https://jwtsecret.com/generate)
- Ter Docker e Docker Compose

## Como executar
```
docker compose build
docker compose up 
```
