#!/bin/bash
set -e
read -p "Enter release version: " VERSION

read -p "Releasing $VERSION - are you sure? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Releasing $VERSION ..."
  npm run fullcheck
  npm run clean
  VERSION=$VERSION npm run build

  # commit
  git add -A
  git commit -m "[build] $VERSION"
  npm version $VERSION --message "[release] $VERSION"

  # publish
  git push origin refs/tags/v$VERSION
  git push
  npm publish
fi