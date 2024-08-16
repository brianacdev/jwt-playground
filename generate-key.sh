
ssh-keygen -t rsa -b 2048 -m PEM -f ./keys/jwtRS256.key
# Don't add passphrase
openssl rsa -in ./keys/jwtRS256.key -pubout -outform PEM -out ./keys/jwtRS256.key.pub
cat ./keys/jwtRS256.key
cat ./keys/jwtRS256.key.pub
