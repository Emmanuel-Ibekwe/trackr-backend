const mongoose = require("mongoose");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chai = require("chai");

chai.use(sinonChai);
const expect = chai.expect;

const authService = require("../../src/services/auth.js");
const bcryptjs = require("bcryptjs");
const User = require("../../src/models/user");
const { generatePassword } = require("../../src/utils/auth");

describe("createUser Service", () => {
  let hashStub, findOneStub, saveStub, sandbox;
  const fakeHashedPassword = "fhfhgjkggklgj";
  const fakeId = "hjklkjhghjkjhghjkjh";
  const fakePictureUrl = "www.picture.com";

  const userInput = {
    name: "Emmanuel Ibekwe",
    email: "ibekweemmanuel007@gmail.com",
    password: generatePassword(),
    picture: fakePictureUrl
  };

  const fakeCreatedUser = {
    ...userInput,
    password: fakeHashedPassword,
    _id: fakeId
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    hashStub = sandbox.stub(bcryptjs, "hash");
    findOneStub = sandbox.stub(mongoose.Model, "findOne");

    saveStub = sandbox.stub(User.prototype, "save");

    hashStub.resolves(fakeHashedPassword);
    findOneStub.resolves(null);

    saveStub.resolves(fakeCreatedUser);
  });
  afterEach(() => {
    sandbox.restore();
  });

  it("should return a newly created user", async () => {
    newUser = await authService.createUser(userInput);

    expect(newUser).to.deep.equal(fakeCreatedUser);
  });

  it("should throw a BadRequest error if name is not provided", async () => {
    try {
      await authService.createUser({ ...userInput, name: undefined });
    } catch (err) {
      //   console.log(err);
      expect(err.status).to.equal(400);
      expect(err.message).to.equal("Please fill all fields");
    }
  });

  it("should throw a BadRequest error if email is invalid", async () => {
    try {
      await authService.createUser({ ...userInput, email: "undefined" });
    } catch (err) {
      //   console.log(err);
      expect(err.status).to.equal(400);
      expect(err.message).to.equal("email is invalid");
    }
  });

  it("should throw a BadRequest error if email is not provided", async () => {
    try {
      await authService.createUser({ ...userInput, email: undefined });
    } catch (err) {
      //   console.log(err);
      expect(err.status).to.equal(400);
      expect(err.message).to.equal("Please fill all fields");
    }
  });

  it("should throw a Conflict error if user already exists", async () => {
    try {
      await authService.createUser({ ...userInput, password: "hhfjdkdlflf" });
    } catch (err) {
      //   console.log(err);
      expect(err.status).to.equal(400);
      expect(err.message).to.equal(
        "password must be atleast 8 characters and contain atleast an uppercase, a lowercase, a number or a special character"
      );
    }
  });

  it("should throw a BadRequest error if password does not meet the required conditions", async () => {
    findOneStub.resolves(fakeCreatedUser);
    try {
      await authService.createUser(userInput);
    } catch (err) {
      expect(err.status).to.equal(409);
      expect(err.message).to.equal("email already exists. Try a new email.");
    }
  });
});

describe("signInUser Service", () => {
  let compareStub, findOneStub, sandbox, leanStub;
  let singInData = {
    email: "ibeweeeeeee@gmail.com",
    password: generatePassword()
  };

  const fakeHashedPassword = "fhfhgjkggklgj";
  const fakeId = "hjklkjhghjkjhghjkjh";
  const fakePictureUrl = "www.picture.com";

  //   const userInput = {
  //     name: "Emmanuel Ibekwe",
  //     email: "ibekweemmanuel007@gmail.com",
  //     password: generatePassword(),
  //     picture: fakePictureUrl
  //   };

  const fakeUser = {
    ...singInData,
    picture: fakePictureUrl,
    password: fakeHashedPassword,
    _id: fakeId
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    compareStub = sandbox.stub(bcryptjs, "compare").resolves(true);
    leanStub = sandbox.stub().resolves(fakeUser);
    findOneStub = sandbox
      .stub(mongoose.Model, "findOne")
      .returns({ lean: leanStub });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return a user", async () => {
    const user = await authService.signInUser(singInData);

    expect(findOneStub).to.have.been.calledWith({
      email: "ibeweeeeeee@gmail.com"
    });
    expect(user).to.deep.equal(fakeUser);
  });

  it("should return an Unathourized error, User with this email could not be found.", async () => {
    leanStub.resolves(null);
    findOneStub.returns({ lean: leanStub });
    try {
      const user = await authService.signInUser(singInData);
    } catch (err) {
      //   console.log(err);
      expect(err.status).to.equal(401);
      expect(err.message).to.equal("User with this email could not be found.");
    }
  });
});
