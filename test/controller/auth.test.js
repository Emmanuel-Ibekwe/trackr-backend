const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chai = require("chai");

chai.use(sinonChai);
const expect = chai.expect;

const authController = require("./../../src/controllers/auth");
const tokenService = require("./../../src/services/token.js");
const authService = require("./../../src/services/auth.js");

const { generatePassword } = require("./../../src/utils/auth.js");
const sendEmailModule = require("./../../src/utils/sendEmail.js");

describe("Signup Controller", () => {
  let res, req, createUserStub, generateTokenStub, sendEmailStub;
  let sandbox;

  const fakeHashedPassword = "fhfhgjkggklgj";
  const fakeId = "hjklkjhghjkjhghjkjh";
  const fakePictureUrl = "www.picture.com";
  const fakeToken = "rhjkljhghjkjhghj";

  const userInput = {
    name: "Emmanuel Ibekwe",
    email: "ibekweemmanuel007@gmail.com",
    password: generatePassword(),
    picture: fakePictureUrl
  };

  const newUser = {
    _id: fakeId,
    name: "Emmanuel Ibekwe",
    email: "ibekweemmanuel007@gmail.com",
    picture: fakePictureUrl
  };

  const fakeCreatedUser = {
    ...userInput,
    password: fakeHashedPassword,
    _id: fakeId
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    console.log("inside beforeEach");
    createUserStub = sandbox.stub(authService, "createUser");
    console.log("createUser", createUserStub);
    createUserStub.resolves(fakeCreatedUser);

    generateTokenStub = sandbox.stub(tokenService, "generateToken");
    generateTokenStub.resolves(fakeToken);

    sendEmailStub = sandbox.stub(sendEmailModule, "sendEmail").resolves();
  });

  afterEach(() => {
    console.log("inside afterEach");
    sandbox.restore();
  });

  it("should sign up user successfully", async done => {
    const statusJsonSpy = sandbox.spy();

    res = {
      json: sandbox.spy(),
      status: sandbox.stub().returns({ json: statusJsonSpy })
    };
    req = { body: userInput };

    const next = err => {
      console.log("err", err);
    };

    try {
      await authController.signup(req, res, next);

      // createUserStub();
      expect(createUserStub).to.have.been.calledOnce;
      expect(createUserStub).to.have.been.calledOnceWith(userInput);
      expect(generateTokenStub).to.have.been.calledTwice;
      expect(sendEmailStub).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledOnceWith(201);
      expect(res.json).to.have.been.calledWith({
        message: "sign up successful",
        accessToken: fakeToken,
        refreshToken: fakeToken,
        user: newUser
      });

      done();
    } catch (error) {
      done(error);
    }
  }); //
});
