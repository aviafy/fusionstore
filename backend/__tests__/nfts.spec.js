const request = require('supertest');
const bcrypt = require('bcrypt');
const NFT = require('../models/nft');
const User = require('../models/user');

const app = () => global.__APP__;

const ADDR = '0x1234567890123456789012345678901234567890';
const ADDR2 = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

describe('NFT Routes', () => {
  beforeEach(async () => {
    await NFT.deleteMany({});
  });

  async function adminAuth() {
    const email = `adm-${Date.now()}@test.com`;
    const passwordHash = await bcrypt.hash('adminpass123', 4);
    await User.create({ email, passwordHash, name: 'Admin', role: 'admin' });
    const login = await request(app()).post('/api/auth/login').send({ email, password: 'adminpass123' });
    return { token: login.body.token, email };
  }

  describe('GET /api/nfts', () => {
    it('should return all NFTs', async () => {
      await NFT.create({
        name: 'Test NFT',
        description: 'A test NFT',
        image: 'https://example.com/image.jpg',
        price: 1.5,
        collection: 'Test Collection',
        contractAddress: ADDR,
        tokenId: '001',
        creator: 'TestArtist',
      });

      const res = await request(app()).get('/api/nfts');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Test NFT');
    });

    it('should filter NFTs by rarity', async () => {
      await NFT.create([
        {
          name: 'Rare NFT',
          description: 'A rare NFT',
          image: 'https://example.com/image1.jpg',
          price: 2.0,
          collection: 'Test Collection',
          rarity: 'Rare',
          contractAddress: ADDR,
          tokenId: '001',
          creator: 'Artist1',
        },
        {
          name: 'Common NFT',
          description: 'A common NFT',
          image: 'https://example.com/image2.jpg',
          price: 0.5,
          collection: 'Test Collection',
          rarity: 'Common',
          contractAddress: ADDR2,
          tokenId: '002',
          creator: 'Artist2',
        },
      ]);

      const res = await request(app()).get('/api/nfts?rarity=Rare');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].rarity).toBe('Rare');
    });
  });

  describe('GET /api/nfts/:id', () => {
    it('should return a single NFT by ID', async () => {
      const nft = await NFT.create({
        name: 'Single NFT',
        description: 'A single NFT',
        image: 'https://example.com/image.jpg',
        price: 1.5,
        collection: 'Test Collection',
        contractAddress: ADDR,
        tokenId: '001',
        creator: 'TestArtist',
      });

      const res = await request(app()).get(`/api/nfts/${nft._id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Single NFT');
      expect(res.body.views).toBe(1);
    });
  });

  describe('POST /api/nfts', () => {
    it('401 without admin', async () => {
      const res = await request(app())
        .post('/api/nfts')
        .send({
          name: 'New NFT',
          description: 'A brand new NFT',
          image: 'https://example.com/image.jpg',
          price: 2.5,
          collection: 'New Collection',
          contractAddress: ADDR,
          tokenId: '001',
          creator: 'NewArtist',
        });
      expect(res.status).toBe(401);
    });

    it('should create a new NFT as admin', async () => {
      const { token, email } = await adminAuth();
      const nftData = {
        name: 'New NFT',
        description: 'A brand new NFT',
        image: 'https://example.com/image.jpg',
        price: 2.5,
        collection: 'New Collection',
        contractAddress: ADDR,
        tokenId: '001',
        creator: 'NewArtist',
      };

      const res = await request(app()).post('/api/nfts').set('Authorization', `Bearer ${token}`).send(nftData);
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('New NFT');
      await User.deleteOne({ email });
    });
  });

  describe('DELETE /api/nfts/:id', () => {
    it('should delete an NFT as admin', async () => {
      const { token, email } = await adminAuth();
      const nft = await NFT.create({
        name: 'NFT to Delete',
        description: 'Will be deleted',
        image: 'https://example.com/image.jpg',
        price: 1.0,
        collection: 'Test',
        contractAddress: ADDR,
        tokenId: '001',
        creator: 'Artist',
      });

      const res = await request(app()).delete(`/api/nfts/${nft._id}`).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      const deleted = await NFT.findById(nft._id);
      expect(deleted).toBeNull();
      await User.deleteOne({ email });
    });
  });
});
