.PHONY: setup start db-start db-stop migrate prisma-studio check-env

setup: check-env
	npm install
	make db-start
	sleep 5
	make migrate

start: check-env
	npm run dev

db-start:
	docker-compose up -d

db-stop:
	docker-compose down

migrate:
	npx prisma migrate dev

prisma-studio:
	npx prisma studio

check-env:
	@if [ ! -f .env ]; then \
		cp .env.sample .env; \
		echo "Created .env file. Please update it with your configuration."; \
		exit 1; \
	fi
	@if [ "$$(grep -c "ENV_CONFIGURED=true" .env)" -eq 0 ]; then \
		echo "Please update your .env file and set ENV_CONFIGURED=true when done."; \
		exit 1; \
	fi