#!/bin/sh
set -e

pnpm drizzle-kit push --force

exec node build
