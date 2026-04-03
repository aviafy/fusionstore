const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..', 'public', 'images');

const IMAGES = {
  products: [
    { name: 'product-1.jpg', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop&q=80' },
    { name: 'product-2.jpg', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop&q=80' },
    { name: 'product-3.jpg', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop&q=80' },
    { name: 'product-4.jpg', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&q=80' },
    { name: 'product-5.jpg', url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop&q=80' },
    { name: 'product-6.jpg', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop&q=80' },
    { name: 'product-7.jpg', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80' },
    { name: 'product-8.jpg', url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=600&fit=crop&q=80' },
    { name: 'product-9.jpg', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop&q=80' },
    { name: 'product-10.jpg', url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=600&fit=crop&q=80' },
    { name: 'product-11.jpg', url: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&h=600&fit=crop&q=80' },
    { name: 'product-12.jpg', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop&q=80' },
    { name: 'product-13.jpg', url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&h=600&fit=crop&q=80' },
    { name: 'product-14.jpg', url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop&q=80' },
    { name: 'product-15.jpg', url: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&h=600&fit=crop&q=80' },
    { name: 'product-16.jpg', url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop&q=80' },
    { name: 'product-17.jpg', url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop&q=80' },
    { name: 'product-18.jpg', url: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=600&fit=crop&q=80' },
    { name: 'product-19.jpg', url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=600&fit=crop&q=80' },
    { name: 'product-20.jpg', url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop&q=80' },
  ],
  nfts: [
    { name: 'nft-1.jpg', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=800&fit=crop&q=80' },
    { name: 'nft-2.jpg', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&h=800&fit=crop&q=80' },
    { name: 'nft-3.jpg', url: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=800&fit=crop&q=80' },
    { name: 'nft-4.jpg', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=800&fit=crop&q=80' },
    { name: 'nft-5.jpg', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&h=800&fit=crop&q=80' },
    { name: 'nft-6.jpg', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&h=800&fit=crop&q=80' },
    { name: 'nft-7.jpg', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop&q=80' },
    { name: 'nft-8.jpg', url: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&h=800&fit=crop&q=80' },
    { name: 'nft-9.jpg', url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=800&fit=crop&q=80' },
    { name: 'nft-10.jpg', url: 'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=800&h=800&fit=crop&q=80' },
  ],
  services: [
    { name: 'service-1.jpg', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop&q=80' },
    { name: 'service-2.jpg', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop&q=80' },
    { name: 'service-3.jpg', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=500&fit=crop&q=80' },
    { name: 'service-4.jpg', url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=500&h=500&fit=crop&q=80' },
    { name: 'service-5.jpg', url: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=500&h=500&fit=crop&q=80' },
    { name: 'service-6.jpg', url: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=500&h=500&fit=crop&q=80' },
    { name: 'service-7.jpg', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=500&fit=crop&q=80' },
    { name: 'service-8.jpg', url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=500&fit=crop&q=80' },
    { name: 'service-9.jpg', url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=500&fit=crop&q=80' },
    { name: 'service-10.jpg', url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=500&fit=crop&q=80' },
    { name: 'service-11.jpg', url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=500&fit=crop&q=80' },
    { name: 'service-12.jpg', url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=500&fit=crop&q=80' },
    { name: 'service-13.jpg', url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=500&fit=crop&q=80' },
    { name: 'service-14.jpg', url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop&q=80' },
    { name: 'service-15.jpg', url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop&q=80' },
  ],
  avatars: [
    { name: 'avatar-1.jpg', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80' },
    { name: 'avatar-2.jpg', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80' },
    { name: 'avatar-3.jpg', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&q=80' },
    { name: 'avatar-4.jpg', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&q=80' },
    { name: 'avatar-5.jpg', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&q=80' },
    { name: 'avatar-6.jpg', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&q=80' },
    { name: 'avatar-7.jpg', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&q=80' },
    { name: 'avatar-8.jpg', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&q=80' },
  ],
};

function download(url, dest, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return download(res.headers.location, dest, maxRedirects - 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('Downloading images to', BASE_DIR);
  let total = 0;
  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const [category, images] of Object.entries(IMAGES)) {
    const dir = path.join(BASE_DIR, category);
    fs.mkdirSync(dir, { recursive: true });
    console.log(`\n[${category}] ${images.length} images`);

    for (const img of images) {
      total++;
      const dest = path.join(dir, img.name);
      if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
        console.log(`  skip  ${img.name}`);
        skipped++;
        continue;
      }
      try {
        await download(img.url, dest);
        const size = fs.statSync(dest).size;
        console.log(`  ok    ${img.name} (${(size / 1024).toFixed(0)} KB)`);
        ok++;
        await sleep(200);
      } catch (err) {
        console.error(`  FAIL  ${img.name}: ${err.message}`);
        failed++;
      }
    }
  }

  console.log(`\nDone: ${ok} downloaded, ${skipped} skipped, ${failed} failed (${total} total)`);
  if (failed > 0) process.exit(1);
}

main();
