# MediaGuard — запуск через Docker

Проект состоит из трёх контейнеров: PostgreSQL, backend (Express) и frontend
(статика, собранная Vite, раздаётся через nginx).

## Запуск

```bash
cp .env.example .env
docker compose up --build
```

Первая сборка займёт пару минут. После старта:

- Фронтенд: http://localhost:3000
- API бэкенда: http://localhost:5000/api
- PostgreSQL: localhost:5432 (пробрасывается наружу для отладки через любой
  SQL-клиент; для самой демонстрации не нужен)

Схема БД (`db.sql`) применяется автоматически при первом запуске контейнера
`db` — вручную ничего накатывать не нужно.

## Тестовые учётные записи

| Роль      | Email                     | Пароль         |
|-----------|---------------------------|----------------|
| Админ     | admin@mediaguard.ru       | admin123       |
| Модератор | moderator@mediaguard.ru   | moderator123   |

Обычного пользователя (роль `user`) можно создать напрямую через API,
поскольку публичная регистрация в интерфейсе отключена по спецификации:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"reader","email":"reader@mediaguard.ru","password":"reader123"}'
```
Свежесозданный пользователь получает роль `user`; повысить её до
`moderator`/`admin` может администратор в разделе «Пользователи».

## Демонстрация на другом компьютере (например, на компьютере преподавателя)

Если открываете фронтенд не с `localhost`, а по IP-адресу машины, на которой
поднят Docker, поменяйте в `.env` перед `docker compose up --build`:

```
VITE_API_URL=http://<IP-адрес-машины>:5000/api
CORS_ORIGIN=http://<IP-адрес-машины>:3000
```

`VITE_API_URL` встраивается в статику на этапе сборки фронтенда, поэтому
после изменения нужно пересобрать образ (`docker compose up --build`), а не
просто перезапустить контейнер.

## Остановка и сброс данных

```bash
docker compose down        # остановить контейнеры, данные БД сохраняются
docker compose down -v     # остановить и удалить volume с данными БД
                            # (следующий запуск накатит db.sql заново)
```

## Локальная разработка без Docker

Бэкенд и фронтенд можно запускать и напрямую (`npm run dev` /
`npm run dev`), тогда нужен локально установленный PostgreSQL и файлы
`.env` в `backend/` и `frontend/` — шаблоны лежат рядом
(`backend/.env.example`, `frontend/.env.example`).
