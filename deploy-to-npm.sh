#!/bin/bash

echo 'Building @mindspace-io/react'
nx build utils-react 
cp ./libs/utils/react/README.md ./dist/libs/utils/react/README.md
nx test utils-react
echo ''
echo 'Preparing to npm deploy updates to @mindspace-io/react'
echo ''
cd $(pwd)/dist/libs/utils/react && ls
echo ''
echo 'Publising...'
npm publish --access public