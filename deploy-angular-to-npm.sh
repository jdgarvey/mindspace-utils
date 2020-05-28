#!/bin/bash

echo 'Building @mindspace-io/angualr'
nx build utils-angular --prod 
cp ./libs/utils/angular/README.md ./dist/libs/utils/angular/README.md
echo ''
echo 'Preparing to npm deploy updates to @mindspace-io/angular'
echo ''
cd $(pwd)/dist/libs/utils/angular && ls
echo ''
echo -e "\033[1;92m Publishing Angular Lib!"
echo -e "\033[1;95m npm publish --access public" 