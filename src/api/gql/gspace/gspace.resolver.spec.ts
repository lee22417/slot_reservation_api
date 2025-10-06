import { Test, TestingModule } from '@nestjs/testing';
import { GspaceResolver } from './gspace.resolver';
import { GspaceService } from './gspace.service';

describe('GspaceResolver', () => {
  let resolver: GspaceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GspaceResolver, GspaceService],
    }).compile();

    resolver = module.get<GspaceResolver>(GspaceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
