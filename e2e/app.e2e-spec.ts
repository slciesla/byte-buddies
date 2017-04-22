import { BytePage } from './app.po';

describe('byte App', () => {
  let page: BytePage;

  beforeEach(() => {
    page = new BytePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
