#!/bin/echo USAGE: source 
#!/bin/bash

echo 'Building @mindspace-io/react-akita'
nx build utils-react-akita 
cp ./libs/utils/react-akita/README.md ./dist/libs/utils/react-akita/README.md
cp ./LICENSE ./dist/libs/utils/react-akita/LICENSE
nx test utils-react-akita
echo ''
echo 'Preparing to npm deploy updates to @mindspace-io/react-akita'
echo ''
cd ./dist/libs/utils/react-akita && ls
echo ''
echo -e "\033[1;92m Publishing '@mindspace-io/react-akita'!"
echo -e "\033[1;95m npm publish --access public" 