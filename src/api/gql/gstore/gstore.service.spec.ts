import { Test, TestingModule } from '@nestjs/testing';
import { GstoreService } from './gstore.service';

describe('GstoreService', () => {
  let service: GstoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GstoreService],
    }).compile();

    service = module.get<GstoreService>(GstoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
