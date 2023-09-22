
PACKAGES=`ls -d packages/*`
LIBS=`ls -d libs/*`

for i in $PACKAGES; do
  echo "copying license to $i"
  cp LICENSE $i
  cp NOTICE $i
  echo "set license in package.json for $i"
  cd $i
  node -e 'const fs = require("fs"); const pkg = JSON.parse(fs.readFileSync("package.json")); pkg.license = "Apache-2.0"; fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\r\n");'
  cd ../..
done

for i in $LIBS; do
  echo "copying license to $i"
  cp LICENSE $i
  cp NOTICE $i
  echo "set license in package.json for $i"
  cd $i
  node -e 'const fs = require("fs"); const pkg = JSON.parse(fs.readFileSync("package.json")); pkg.license = "Apache-2.0"; fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\r\n" );'
  cd ../..
done