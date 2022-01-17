import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { idlFactory } from '@idlFactory/ndp/index';
import { StoicIdentity } from 'ic-stoic-identity';
import { idlFactory as badgerIdlFactory } from '../../idlFactory/badge/index.js';

class NdpService {
  agent!: HttpAgent;
  identity!: Identity;
  token: string;
  canisterId: string;
  badgeCanisterId: string;
  actor!: ImplementedActorMethods;
  badgeActor!: ImplementedActorMethods;

  loginType: string;
  pending: boolean;
  constructor(params: ConstructorParams) {
    const { token, canisterId, badgeCanisterId } = params;
    this.token = token;
    this.canisterId = canisterId;
    this.badgeCanisterId = badgeCanisterId;
    this.loginType = window.localStorage.getItem('loginType') || '';
    this.pending = false;
  }
  async initService(type?: string) {
    // Concurrent
    if (this.pending) return;
    if (!this.actor) {
      this.pending = true;
      // Fetch auth identity,if Not authorized identity will be false, need auth
      const identity = null;
      // Previous Login Type
      if (!type) {
        type = this.loginType;
      }
      switch (type) {
        case 'stoic':
          await this.getStoicActor();
          break;
        case 'plug':
          await this.getPlugActor();
          break;
        default:
          await this.getStoicActor();
          break;
      }

      type && window.localStorage.setItem('loginType', type);
      this.pending = false;
      return;
    }
    // IF Plug ,check connect status
    if (type === 'plug' || this.loginType === 'plug') {
      const connected = await window.ic.plug.isConnected();
      if (!connected) {
        console.log('Plug Disconnected,reconnect');
        try {
          await window.ic.plug.requestConnect({
            whitelist: [this.canisterId],
            timeout: 1e4, // Ten seconds
          });
        } catch (error) {
          console.error('Plug connect Error', error);
        }
      }
    }
  }
  resetService() {
    // @ts-ignore
    this.actor = undefined;
    // @ts-ignore
    this.agent = undefined;
    // @ts-ignore
    this.identity = null;
  }
  async getStoicActor() {
    let identity = await StoicIdentity.load();
    if (identity === false) {
      // Has not beed authorized,
      identity = await StoicIdentity.connect();
    }
    this.identity = identity;
    this.agent = new HttpAgent({ identity });
    this.actor = Actor.createActor(idlFactory, { agent: this.agent, canisterId: this.canisterId });
    this.badgeActor = Actor.createActor(badgerIdlFactory, { agent: this.agent, canisterId: this.badgeCanisterId });
  }
  async getPlugActor() {
    try {
      await window.ic.plug.requestConnect({
        whitelist: [this.canisterId],
        timeout: 1e4, // Ten seconds
      });
      this.actor = await window.ic.plug.createActor({
        canisterId: this.canisterId,
        interfaceFactory: idlFactory,
      });
      this.badgeActor = await window.ic.plug.createActor({
        canisterId: this.badgeCanisterId,
        interfaceFactory: badgerIdlFactory,
      });
    } catch (err) {
      // message.error('Failed authorization');
    }
  }
  async stoicLogin() {
    await this.initService('stoic');
  }
  async plugLogin() {
    await this.initService('plug');
  }

  // NDP conister interface function
  async approve() {
    await this.initService();
    return this.actor.approve();
  }
  async getBalance(arg: any) {
    await this.initService();
    return this.actor.balance(arg);
  }
  async getClaim() {
    await this.initService();
    return this.actor.claim();
  }
  async getAccountId() {
    await this.initService();
    return this.actor.getAccountId();
  }
  async getMetadata() {
    await this.initService();
    return this.actor.metadata();
  }
  async getTransfer(TransferRequest: string) {
    await this.initService();
    return this.actor.transfer();
  }
  async getMinted() {
    await this.initService();
    return this.actor.minted();
  }

  async getSupply(TokenIdentifier: string) {
    await this.initService();
    return this.actor.supply(TokenIdentifier);
  }

  async getClaimStatus() {
    await this.initService();
    return this.actor.claimStatus();
  }

  // badgeActor conister interface function
  async getAllBadgeList() {
    await this.initService();
    return this.badgeActor.getAllBadgeList();
  }
  async getUserBadgeList(arg: any) {
    await this.initService();
    return this.badgeActor.getUserBadgeList(arg);
  }
}

const NDP_TOKEN = 'cf66e87d469890ca0f1f6504eebce076fa587449e9e325dd597b189347c37908';
const canisterId = 'vgqnj-miaaa-aaaal-qaapa-cai';
const badgeCanisterId = 'rfde3-eyaaa-aaaal-qaaua-cai';

export default new NdpService({
  token: NDP_TOKEN,
  canisterId: canisterId,
  badgeCanisterId: badgeCanisterId,
});

// Type
// =================================================
interface ConstructorParams {
  token: string;
  canisterId: string;
  badgeCanisterId: string;
}
interface ImplementedActorMethods {
  // ndp
  approve: () => Promise<{ addr: string }>;
  balance: (arg: any) => Promise<{ ok: BigInt }>;
  claim: () => Promise<{ err?: ''; ok?: '' }>;
  getAccountId: () => Promise<string>;
  metadata: () => Promise<unknown>;
  transfer: () => Promise<unknown>;
  minted: () => Promise<BigInt>;
  supply: (TokenIdentifier: string) => Promise<unknown>;
  claimStatus: () => Promise<{ ok?: '' }>;

  // badge
  getAllBadgeList: () => Promise<Record<string, unknown>>;
  getUserBadgeList: (arg: any) => Promise<{ err?: ''; ok?: '' }>;
}