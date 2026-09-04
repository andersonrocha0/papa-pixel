# PapaPixel

Projeto de estudo em Angular: uma grade de pixels que ligam e desligam
para simular (e jogar) o clássico da minhoca (Snake).

Governança e princípios: [`.specify/memory/constitution.md`](.specify/memory/constitution.md).

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.0.3 (runtime deps currently on Angular 13).

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Os testes end-to-end são executados via [Playwright](https://playwright.dev/) para validar a carga da grade de pixels, controles (pausa/direção) e regras do jogo (comida e colisão).

### Instalação do navegador (primeira execução)

```bash
npx playwright install chromium
```

### Executar a suíte E2E

```bash
npm run test:e2e
```

O Playwright gerencia o servidor de desenvolvimento automaticamente (`http://localhost:4200`), ou reutiliza um `ng serve` já em execução caso esteja rodando localmente.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
