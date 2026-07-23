# Gulp26 — Современная сборка на Gulp 5

Модульная, масштабируемая и расширяемая сборка на базе **Gulp 5** для HTML и WordPress проектов. Автообнаружение компонентов, гибкие режимы сборки и централизованная конфигурация.

## Содержание

- [Возможности](#возможности)
- [Быстрый старт](#быстрый-старт)
- [Мульти-проектная система](#мульти-проектная-система)
  - [Создание проекта](#создание-проекта)
  - [Переключение проектов](#переключение-проектов)
  - [Настройки проекта](#настройки-проекта)
  - [Доступные шаблоны](#доступные-шаблоны)
  - [Команды управления проектами](#команды-управления-проектами)
- [Структура проекта](#структура-проекта)
- [Конфигурация](#конфигурация)
  - [Режимы сборки](#режимы-сборки)
  - [Профили сборки](#профили-сборки)
  - [Режимы CSS](#режимы-css)
  - [Режимы JavaScript](#режимы-javascript)
  - [Режимы HTML](#режимы-html)
- [Компонентная архитектура](#компонентная-архитектура)
  - [Добавление компонента](#добавление-компонента)
  - [Как работает автообнаружение](#как-работает-автообнаружение)
- [Задачи (Tasks)](#задачи-tasks)
  - [Разработка](#разработка)
  - [Production-сборка](#production-сборка)
  - [Отдельные задачи](#отдельные-задачи)
- [SCSS](#scss)
- [JavaScript](#javascript)
- [HTML](#html)
- [Изображения](#изображения)
- [SVG](#svg)
- [Шрифты](#шрифты)
- [Watch и Live Reload](#watch-и-live-reload)
- [Добавление новой задачи](#добавление-новой-задачи)
- [Расширение конфигурации](#расширение-конфигурации)
- [Интернационализация (i18n)](#интернационализация-i18n)
  - [Переключение языка](#переключение-языка)
  - [Добавление нового языка](#добавление-нового-языка)
  - [Структура файлов переводов](#структура-файлов-переводов)
- [Зависимости](#зависимости)
- [Архитектура](#архитектура)

## Возможности

- **Gulp 5** с нативными ES-модулями (`"type": "module"`)
- **Автообнаружение компонентов** — создай папку, и компонент подключится автоматически
- **Гибкие режимы сборки** — bundle, separate или оба варианта для CSS, JS и HTML
- **Три профиля сборки** — development, production, production + debug
- **SCSS** — Dart Sass API, `@use`/`@forward`, PostCSS autoprefixer, минификация CleanCSS
- **JavaScript** — esbuild (без Babel), tree shaking, code splitting, source maps, минификация
- **HTML** — `gulp-file-include` с переменными, include-файлами, условной компиляцией
- **Изображения** — sharp: оптимизация, автоматическая генерация WebP и AVIF
- **SVG** — генерация спрайтов через svg-sprite
- **Шрифты** — автоматическое копирование с поддержкой WOFF2
- **Watch** — BrowserSync с умным определением изменённого компонента
- **~15 зависимостей** — минимум и только необходимое

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера с live reload
npm run dev

# Production-сборка
npm run build:prod

# Сборка с отладочной информацией (sourcemaps + metafile)
npm run build:debug
```

## Мульти-проектная система

Gulp26 поддерживает управление несколькими проектами из одной сборки. У каждого проекта свои исходники, конфигурация и выходные файлы.

### Создание проекта

```bash
# Создание с шаблоном
PROJECT_NAME=my-site PROJECT_TEMPLATE=landing npx gulp project:create

# Создание с произвольным путём (включая другие диски)
PROJECT_NAME=my-site PROJECT_PATH=/path/to/my-site npx gulp project:create

# Windows (PowerShell) — проект на другом диске
$env:PROJECT_NAME="my-site"; $env:PROJECT_PATH="E:\projects\my-site"; npx gulp project:create

# Windows (Git Bash / MSYS2) — обязательно в кавычках!
PROJECT_NAME="my-site" PROJECT_PATH="E:/projects/my-site" npx gulp project:create

# Создание без шаблона (пустой проект)
PROJECT_NAME=my-site npx gulp project:create
```

Проекты могут находиться где угодно — внутри `projects/`, на другом диске (`E:\`, `/mnt/data/`), или в произвольном каталоге. При перезаписи или удалении проекта по внешнему пути система запросит дополнительное подтверждение для безопасности.

### Переключение проектов

```bash
# Переключиться на проект
PROJECT_NAME=my-site npx gulp project:use

# Собрать активный проект
npx gulp build

# Список всех проектов
npx gulp project:list

# Деактивировать (вернуться к глобальной сборке)
npx gulp project:deactivate
```

### Удаление проекта

```bash
# Удалить только запись из реестра (файлы проекта сохраняются)
PROJECT_NAME=my-site npx gulp project:remove

# Удалить запись И файлы проекта
PROJECT_NAME=my-site DELETE_FILES=true npx gulp project:remove

# Windows (PowerShell)
$env:PROJECT_NAME="my-site"; $env:DELETE_FILES="true"; npx gulp project:remove

# Windows (Git Bash / MSYS2) — кавычки обязательны!
PROJECT_NAME="my-site" DELETE_FILES="true" npx gulp project:remove
```

Если несколько проектов имеют одно имя (например, `my-site` в разных путях), система покажет все расположения и попросит указать нужное:

```bash
# Уточнить путь для удаления конкретного проекта
PROJECT_NAME=my-site PROJECT_PATH=/path/to/target npx gulp project:remove

# PowerShell
$env:PROJECT_NAME="my-site"; $env:PROJECT_PATH="E:\projects\my-site"; $env:DELETE_FILES="true"; npx gulp project:remove
```

> Внешние проекты (вне рабочей области) требуют дополнительного подтверждения перед удалением файлов.

### Настройки проекта

Каждый проект может иметь свой `project.config.js`, который переопределяет глобальный `gulp.config.js`:

```js
// projects/my-site/project.config.js
export default {
  modes: {
    css: { bundle: true, separate: false },
    js: { bundle: true, separate: false, splitting: true },
    html: { mode: 'bundle' },
  },
  scss: {
    loadPaths: ['node_modules/bootstrap/scss'],
  },
};
```

Конфигурация объединяется по порядку: **базовый конфиг → user override → project override**.

### Доступные шаблоны

| Шаблон | Описание |
|--------|----------|
| `landing` | одностраничный лендинг с header, hero, footer |
| `multipage` | многостраничный сайт с общим header/footer |

### Команды управления проектами

| Команда | Описание |
|---------|----------|
| `npx gulp project:list` | Список всех зарегистрированных проектов |
| `npx gulp project:use` | Переключиться на проект (через переменную `PROJECT_NAME`) |
| `npx gulp project:create` | Создать новый проект |
| `npx gulp project:remove` | Удалить проект (через `DELETE_FILES=true` удалить и файлы) |
| `npx gulp project:deactivate` | Деактивировать все проекты (глобальный режим) |

## Структура проекта

```
gulp26/
├── gulpfile.js                  # Точка входа: импорт и регистрация задач
├── gulp.config.js               # Пользовательские override-конфиги
├── package.json
│
├── gulp/
│   ├── config/
│   │   ├── index.js             # Хаб конфигурации (merge всех модулей + user override)
│   │   ├── paths.js             # Все пути src/dest
│   │   ├── modes.js             # Переключатели bundle/separate/both
│   │   ├── scss.js              # Опции Sass + PostCSS
│   │   ├── js.js                # Опции esbuild
│   │   ├── html.js              # Опции file-include + минификации
│   │   ├── images.js            # WebP/AVIF, настройки качества
│   │   ├── svg.js               # Конфиг SVG-спрайта
│   │   ├── fonts.js             # Опции обработки шрифтов
│   │   └── server.js            # Опции BrowserSync
│   │
│   ├── tasks/
│   │   ├── styles.js            # SCSS → PostCSS → CSS
│   │   ├── scripts.js           # JS-бандлинг через esbuild
│   │   ├── pages.js             # Обработка HTML
│   │   ├── images.js            # Оптимизация изображений
│   │   ├── svg.js               # Генерация SVG-спрайта
│   │   ├── fonts.js             # Копирование шрифтов
│   │   ├── clean.js             # Очистка директорий
│   │   ├── serve.js             # BrowserSync + watch
│   │   └── components.js        # Диагностика компонентов
│   │
│   ├── utils/
│   │   ├── logger.js            # Цветной вывод в терминал
│   │   ├── component.js         # Автообнаружение компонентов
│   │   ├── cache.js             # Кэш модификаций файлов
│   │   ├── env.js               # Определение среды
│   │   └── merge.js             # Утилита глубокого слияния
│   │
│   └── plugins.js               # Централизованный импорт плагинов
│
├── src/
│   ├── index.html               # Главная страница
│   ├── partials/                # Общие шаблоны
│   ├── scss/
│   │   ├── app.scss             # Точка входа для глобальных стилей
│   │   ├── _variables.scss      # Дизайн-токены
│   │   ├── _mixins.scss         # SCSS-миксины
│   │   └── _base.scss           # CSS-сброс / базовые стили
│   ├── js/
│   │   ├── app.js               # Точка входа для глобального JS
│   │   └── utils/helpers.js     # Утилиты
│   ├── components/              # Автообнаруживаемые компоненты
│   │   ├── header/
│   │   │   ├── header.html
│   │   │   ├── header.scss
│   │   │   └── header.js
│   │   ├── hero/
│   │   │   ├── hero.html
│   │   │   └── hero.scss
│   │   └── footer/
│   │       ├── footer.html
│   │       ├── footer.scss
│   │       └── footer.js
│   ├── images/
│   ├── fonts/
│   └── svg/
│
├── dist/                        # Выход сборки (development)
└── public/                      # Выход сборки (production)
```

## Конфигурация

Всё поведение сборки управляется двумя файлами:

| Файл | Назначение |
|------|-----------|
| `gulp/config/*.js` | Базовая конфигурация (по одному файлу на каждую область) |
| `gulp.config.js` | Пользовательские override-ы (deep-merge при запуске) |

Редактируй только `gulp.config.js`. Базовые файлы содержат разумные значения по умолчанию.

### Режимы сборки

Отредактируй `gulp.config.js` для переключения режимов:

```js
export default {
  modes: {
    css: { bundle: true, separate: false },
    js: { bundle: true, separate: false, splitting: false },
    html: { mode: 'bundle' },
  },
};
```

Изменения в gulp-задачах не требуются.

### Профили сборки

| Команда | Режим | Sourcemaps | Минификация |
|---------|-------|-----------|-------------|
| `npm run dev` | development | да | нет |
| `npm run build` | development | да | нет |
| `npm run build:prod` | production | нет | да |
| `npm run build:debug` | debug | да + metafile | да |

### Режимы CSS

| `bundle` | `separate` | Результат |
|----------|-----------|-----------|
| `true` | `false` | Один `style.css` со всеми стилями |
| `false` | `true` | Отдельные `header.css`, `hero.css`, `footer.css` |
| `true` | `true` | Оба варианта: общий бандл + покомпонентные файлы |

### Режимы JavaScript

| `bundle` | `separate` | Результат |
|----------|-----------|-----------|
| `true` | `false` | Один `app.js` бандл |
| `false` | `true` | Отдельные `header.js`, `hero.js`, `footer.js` |
| `true` | `true` | Оба варианта: общий бандл + покомпонентные файлы |

### Режимы HTML

| `mode` | Результат |
|--------|-----------|
| `'bundle'` | `index.html` со всеми resolved-include |
| `'separate'` | Отдельные `components/header.html` и т.д. |
| `'both'` | Оба варианта: главная страница + покомпонентный HTML |

## Компонентная архитектура

Компоненты — ядро этой сборки. Каждый компонент — автономный блок в `src/components/`.

### Добавление компонента

Создай новую папку с любой комбинацией файлов `.scss`, `.js` и `.html`:

```
src/components/gallery/
├── gallery.html     # HTML-фрагмент (необязательно)
├── gallery.scss     # Стили компонента (необязательно)
└── gallery.js       # Логика компонента (необязательно)
```

Всё. Сборка автоматически:

1. **Подключит** `gallery.scss` в CSS-бандл (bundle-режим)
2. **Собьёт** `gallery.js` в `app.js` (bundle-режим)
3. **Сделает** `gallery.html` доступным для `@@include` в шаблонах

Ручная регистрация не требуется.

### Как работает автообнаружение

Модуль `gulp/utils/component.js` сканирует `src/components/` при каждой сборке:

```js
import { discoverComponents } from './gulp/utils/component.js';

const components = discoverComponents('src/components');
// Возвращает:
// [
//   { name: 'header', hasScss: true, hasJs: true, hasHtml: true, ... },
//   { name: 'gallery', hasScss: true, hasJs: false, hasHtml: true, ... },
// ]
```

Каждая задача (`styles`, `scripts`, `pages`) вызывает эту функцию и обрабатывает только релевантные компоненты.

### Использование компонентного HTML

В главном `index.html` подключай HTML компонентов с переменными:

```html
@@include('components/header/header.html', {
  "title": "Моя страница",
  "navItems": "home,about,contact"
})
```

### Автономность компонентов

Каждый компонент полностью автономен:
- Его SCSS может использовать `@use 'variables'` для доступа к глобальным токенам
- Его JS работает независимо со своим слушателем `DOMContentLoaded`
- Его HTML — самодостаточный фрагмент

## Задачи (Tasks)

### Разработка

```bash
npm run dev
```

Запускает BrowserSync dev-сервер на `http://localhost:3000` с отслеживанием файлов. Браузер открывается автоматически.

### Production-сборка

```bash
npm run build:prod
```

Полная production-сборка с минификацией, без sourcemaps, оптимизированными изображениями.

### Отдельные задачи

```bash
npx gulp styles      # Только компиляция SCSS
npx gulp scripts     # Только бандлинг JS
npx gulp pages       # Только обработка HTML
npx gulp images      # Только оптимизация изображений
npx gulp svg         # Только генерация SVG-спрайта
npx gulp fonts       # Только копирование шрифтов
npx gulp components  # Список обнаруженных компонентов
npx gulp clean       # Удаление директории dist/
```

## SCSS

**Движок:** Dart Sass API (напрямую, без gulp-sass)

**Возможности:**
- Полная поддержка `@use` и `@forward`
- PostCSS autoprefixer для вендорных префиксов
- Минификация CleanCSS в production
- Source maps в development
- Компонентные стили автоматически подключаются в bundle-режиме

**Глобальные токены** (`_variables.scss`):
```scss
$color-primary: #16c79a;
$breakpoint-md: 768px;
$spacing-unit: 8px;
```

**Компонентный SCSS** имеет доступ к глобальным переменным:
```scss
@use 'variables' as *;

.hero {
  color: $color-primary;  // работает!
}
```

## JavaScript

**Движок:** esbuild API (напрямую, без gulp-плагина)

**Возможности:**
- ES-модули, TypeScript, JSX/TSX из коробки
- Tree shaking
- Code splitting (опционально через `splitting: true`)
- Source maps в development
- Минификация в production
- Компонентный JS автоматически подключается в bundle-режиме

**Глобальные утилиты** (`src/js/utils/helpers.js`):
```js
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
```

**Импорт в app.js:**
```js
import './utils/helpers.js';
import { qs } from './utils/helpers.js';
```

## HTML

**Движок:** `gulp-file-include`

**Возможности:**
- `@@include('path/to/file.html')` — подключение файлов
- `@@include('file.html', { "key": "value" })` — подключение с переменными
- Условная компиляция через контекст build-режима
- Минификация в production через `html-minifier-terser`

**Пример:**
```html
@@include('partials/head.html', {
  "title": "Главная страница",
  "description": "Добро пожаловать на наш сайт"
})

@@include('components/header/header.html')

<main>
  @@include('components/hero/hero.html')
</main>

@@include('partials/footer.html')
```

## Изображения

**Движок:** sharp API (напрямую)

**Возможности:**
- Автоматическая генерация WebP и AVIF
- Оптимизация JPEG/PNG в production
- Адаптивные варианты через конфиг `sizes`
- Пропуск обработки в dev для скорости (настраивается)

**Структура выхода:**
```
dist/images/
├── photo.jpg          # Оптимизированный оригинал
├── photo.webp         # WebP-вариант
└── photo.avif         # AVIF-вариант
```

## SVG

**Движок:** svg-sprite

**Возможности:**
- Генерация спрайтов на основе symbol
- Автоматическая генерация ID иконок (`icon-{name}`)
- Оптимизированный вывод

**Использование в HTML:**
```html
<svg><use href="svg/sprite.svg#icon-arrow"></use></svg>
```

## Шрифты

**Возможности:**
- Автоматическое копирование `.woff`, `.woff2`, `.ttf`, `.eot`, `.otf`
- Поддержка вложенных директорий
- Генерация WOFF2 (настраивается)

## Watch и Live Reload

BrowserSync отслеживает изменения и запускает интеллектуальную пересборку:

| Изменённый файл | Триггер пересборки |
|-----------------|-------------------|
| `src/scss/app.scss` | Полная пересборка SCSS |
| `src/components/header/header.scss` | Пересборка CSS компонента |
| `src/js/app.js` | Полная пересборка JS |
| `src/components/header/header.js` | Пересборка JS компонента |
| `src/**/*.html` | Пересборка HTML |
| `src/images/**/*` | Обработка изображений |
| `src/svg/**/*` | Пересборка SVG-спрайта |
| `src/fonts/**/*` | Копирование шрифтов |

В консоли отображается, какой компонент был пересобран:
```
[CSS] Component header rebuilt
[JS] Component hero rebuilt
[styles] Global SCSS changed
```

## Добавление новой задачи

1. Создай `gulp/tasks/my-task.js`:

```js
import config from '../config/index.js';
import { info, success } from '../utils/logger.js';
import { browserSync } from '../plugins.js';

const TASK = 'my-task';

export async function myTask() {
  info(TASK, 'Running...');

  // Твоя логика

  success(TASK, 'Done');
  browserSync.reload();
}
```

2. Зарегистрируй в `gulpfile.js`:

```js
import { myTask } from './gulp/tasks/my-task.js';
task('my-task', myTask);
```

3. Запусти через `npx gulp my-task`.

## Расширение конфигурации

1. Создай `gulp/config/my-feature.js`:

```js
export const myFeature = {
  enabled: true,
  option: 'value',
};
```

2. Импортируй в `gulp/config/index.js`:

```js
import { myFeature } from './my-feature.js';
const baseConfig = { /* ... */, myFeature };
```

3. Переопредели в `gulp.config.js`:

```js
export default {
  myFeature: { enabled: false },
};
```

Deep merge обеспечивает корректную работу частичных override-ов.

## Интернационализация (i18n)

Все сообщения в терминале (статус сборки, ошибки, информация о компонентах) переводятся через функцию `t()`. Из коробки поддерживаются **русский** и **английский** языки.

### Переключение языка

**Вариант 1: Переменная окружения** (наивысший приоритет)

```bash
LANGUAGE=ru npx gulp build
```

**Вариант 2: Конфигурационный файл** (`gulp.config.js`)

```js
export default {
  language: {
    language: 'ru',
  },
  // ... остальная конфигурация
};
```

**Вариант 3: Проверить текущий язык**

```bash
npx gulp lang
# [lang] Текущий язык: ru
# [lang] Доступные языки: en, ru
# [lang] Установка через переменную LANGUAGE или gulp.config.js
```

### Добавление нового языка

1. Скопируй существующий файл перевода:

```bash
cp gulp/i18n/en.json gulp/i18n/de.json
```

2. Переведи все значения в `gulp/i18n/de.json`:

```json
{
  "common": {
    "complete_in": "fertig in",
    "files": "Dateien",
    "built_in": "erstellt in",
    "skipped": "übersprungen",
    "found": "Gefunden",
    "no_files": "Keine Dateien gefunden",
    "running": "Wird ausgeführt...",
    "done": "Fertig",
    "error": "Fehler",
    "usage": "Verwendung",
    "not_found": "nicht gefunden",
    "available": "Verfügbare",
    "next_steps": "Nächste Schritte"
  },
  "clean": {
    "removing": "Build-Verzeichnisse werden entfernt...",
    "complete": "Bereinigung abgeschlossen"
  },
  "styles": {
    "compiling": "SCSS wird kompiliert...",
    "bundle_done": "CSS-Bundle",
    "separate_done": "Einzelne Styles",
    "complete": "Styles",
    "failed": "Kompilierung fehlgeschlagen"
  }
  // ... переведи все секции
}
```

3. Используй:

```bash
LANGUAGE=de npx gulp build
```

### Структура файлов переводов

Каждый файл в `gulp/i18n/` имеет следующую структуру:

```
gulp/i18n/
├── en.json    # Английский (по умолчанию)
├── ru.json    # Русский
└── de.json    # Немецкий (добавь свой)
```

**Категории ключей:**

| Секция | Описание |
|--------|----------|
| `common` | Общие фразы: "выполнено за", "собрано за", "файлов", "найдено" |
| `clean` | Сообщения задачи очистки |
| `styles` | Сообщения компиляции SCSS |
| `scripts` | Сообщения бандлинга JavaScript |
| `pages` | Сообщения обработки HTML |
| `images` | Сообщения оптимизации изображений |
| `svg` | Сообщения SVG-спрайтов |
| `fonts` | Сообщения копирования шрифтов |
| `serve` | Сообщения watch/сервера |
| `components` | Диагностика компонентов |
| `projects` | CLI управления проектами |
| `language` | Сообщения переключения языка |

**Добавление переводов для новых задач:**

При создании новой задачи добавь ключи перевода в оба файла `en.json` и `ru.json`:

```js
// В файле задачи
import { t } from '../utils/i18n.js';

export async function myTask() {
  info(TASK, t('my_task.starting'));
  // ...
  success(TASK, `${t('my_task.done')} ${t('common.complete_in')} ${time}`);
}
```

Добавь соответствующие ключи в файлы переводов:

```json
// en.json
"my_task": {
  "starting": "Running my task...",
  "done": "Task complete"
}

// ru.json
"my_task": {
  "starting": "Выполнение задачи...",
  "done": "Задача выполнена"
}
```

## Зависимости

| Пакет | Назначение |
|-------|-----------|
| `gulp` | Run-задач |
| `sass` | Компилятор Dart Sass |
| `esbuild` | JS-бандлер |
| `postcss` + `autoprefixer` | Постпроцессинг CSS |
| `clean-css` | Минификация CSS |
| `html-minifier-terser` | Минификация HTML |
| `gulp-file-include` | Include-файлы и шаблонизация HTML |
| `browser-sync` | Dev-сервер + live reload |
| `sharp` | Оптимизация изображений + WebP/AVIF |
| `svg-sprite` | Генерация SVG-спрайтов |
| `del` | Очистка директорий |
| `chalk` + `fancy-log` | Логирование в терминал |
| `gulp-sourcemaps` | Генерация source maps |

## Архитектура

### Принципы проектирования

- **SOLID** — каждая задача имеет одну ответственность
- **DRY** — общие утилиты в `gulp/utils/`, конфиги в `gulp/config/`
- **KISS** — минимальная абстракция, прямые API-вызовы (без лишних gulp-плагинов)
- **ESM** — нативные ES-модули повсюду
- **JSDoc** — типизация через JSDoc-комментарии (без TypeScript)

### Ключевые решения

| Решение | Обоснование |
|---------|------------|
| esbuild API напрямую (без gulp-esbuild) | Полный контроль, инкрементальные сборки, без накладных расходов обёртки |
| Sass API напрямую (без gulp-sass) | Лучшая поддержка ESM, совместимость с `@use`/`@forward` |
| Временные entry-файлы для бандлинга | Авто-включение компонентов без модификации исходных файлов |
| Deep merge конфигов | Пользовательские override-ы не затрагивают базовую конфигурацию |
| Обнаружение компонентов во время сборки | Zero-config регистрация компонентов |

### Поток данных

```
gulp.config.js (пользовательский override)
        ↓
gulp/config/index.js (deep merge)
        ↓
gulp/tasks/* (чтение конфига, обработка файлов)
        ↓
gulp/utils/component.js (обнаружение компонентов)
        ↓
dist/ (выход)
```

## Лицензия

MIT
