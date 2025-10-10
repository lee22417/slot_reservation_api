import { Test, TestingModule } from '@nestjs/testing';
import { PayGuestService } from './pay_guest.service';

describe('PayGuestService', () => {
  let service: PayGuestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayGuestService],
    }).compile();

    service = module.get<PayGuestService>(PayGuestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
