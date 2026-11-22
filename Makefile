.PHONY: build clean run

build:
	cd frontend && npm run build
	rm -rf backend/cmd/server/frontend-dist
	cp -r frontend/dist backend/cmd/server/frontend-dist
	cd backend && go build -o rx-desk ./cmd/server

clean:
	rm -rf backend/cmd/server/frontend-dist
	rm -f backend/rx-desk

run:
	cd backend && ./rx-desk
