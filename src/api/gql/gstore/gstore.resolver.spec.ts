import { Test, TestingModule } from '@nestjs/testing';
import { GstoreResolver } from './gstore.resolver';
import { GstoreService } from './gstore.service';

describe('GstoreResolver', () => {
  let resolver: GstoreResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GstoreResolver, GstoreService],
    }).compile();

    resolver = module.get<GstoreResolver>(GstoreResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
