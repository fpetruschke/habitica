import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v4';

const ENDPOINT = '/user/auth/verify-display-name';

describe('POST /user/auth/verify-display-name', async () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('successfully verifies display name including funky characters', async () => {
    let newDisplayName = 'Sabé 🤬';
    let response = await user.post(ENDPOINT, {
      displayName: newDisplayName,
    });
    expect(response).to.eql({ isUsable: true });
  });

  context('errors', async () => {
    it('errors if display name is not provided', async () => {
      await expect(user.post(ENDPOINT, {
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('errors if display name is a slur', async () => {
      await expect(user.post(ENDPOINT, {
        username: 'TESTPLACEHOLDERSLURWORDHERE',
      })).to.eventually.eql({ isUsable: false, issues: [t('displaynameIssueSlur')] });
    });

    it('errors if display name contains a slur', async () => {
      await expect(user.post(ENDPOINT, {
        username: 'TESTPLACEHOLDERSLURWORDHERE_otherword',
      })).to.eventually.eql({ isUsable: false, issues: [t('displayNameIssueLength'), t('displaynameIssueSlur')] });
      await expect(user.post(ENDPOINT, {
        username: 'something_TESTPLACEHOLDERSLURWORDHERE',
      })).to.eventually.eql({ isUsable: false, issues: [t('displayNameIssueLength'), t('displaynameIssueSlur')] });
      await expect(user.post(ENDPOINT, {
        username: 'somethingTESTPLACEHOLDERSLURWORDHEREotherword',
      })).to.eventually.eql({ isUsable: false, issues: [t('displayNameIssueLength'), t('displaynameIssueSlur')] });
    });

    it('errors if display name has incorrect length', async () => {
      await expect(user.post(ENDPOINT, {
        username: 'this is a very long display name over 30 characters',
      })).to.eventually.eql({ isUsable: false, issues: [t('displayNameIssueLength')] });
    });
  });
});