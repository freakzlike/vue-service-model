#!/bin/bash
set -e
read -p "Enter release version: " VERSION

read -p "Releasing $VERSION - are you sure? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Releasing $VERSION ..."
  npm run fullcheck

  echo
  echo "Full check complete ..."
  echo

  npm run build

  # commit
  npm version $VERSION --no-git-tag-version
  git add -A
  git commit -m "[build] $VERSION"
  git push

  echo
  echo "Version changed and pushed ..."
  echo

  # publish
  npm publish --access=public

  read -p "Publish successful"
fi