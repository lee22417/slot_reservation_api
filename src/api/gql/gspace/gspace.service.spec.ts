import { Test, TestingModule } from '@nestjs/testing';
import { GspaceService } from './gspace.service';

describe('GspaceService', () => {
  let service: GspaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GspaceService],
    }).compile();

    service = module.get<GspaceService>(GspaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
