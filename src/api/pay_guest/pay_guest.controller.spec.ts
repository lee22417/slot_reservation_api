import { Test, TestingModule } from '@nestjs/testing';
import { PayGuestController } from './pay_guest.controller';
import { PayGuestService } from './pay_guest.service';

describe('PayGuestController', () => {
  let controller: PayGuestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayGuestController],
      providers: [PayGuestService],
    }).compile();

    controller = module.get<PayGuestController>(PayGuestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
