import { Index } from './index';
import { Task } from 'algoliasearch';

type GetUserData<State> = () => Promise<State | undefined>;
type SetUserData<State> = (userData: State) => Promise<Task>;

export class StateManager<State extends object> {
  private getUserData: GetUserData<State>;
  private setUserData: SetUserData<State>;
  private currentState: State;
  private defaultState: State;

  constructor({
    getUserData,
    setUserData,
    defaultState,
  }: {
    getUserData: GetUserData<State>;
    setUserData: SetUserData<State>;
    defaultState: State;
  }) {
    this.getUserData = getUserData;
    this.setUserData = setUserData;
    this.defaultState = defaultState;
    this.currentState = defaultState;
  }

  /**
   * Returns the state if it is currently replicated in the index, otherwise resets it.
   */
  check() {
    return this.getUserData().then(
      state => (state === undefined ? this.reset() : state)
    );
  }

  /**
   * Get the state
   */
  async get() {
    return this.currentState
      ? this.currentState
      : (this.getUserData() as State);
  }

  /**
   * Eagerly set state and replicate to the index
   */
  private async set(state: State) {
    this.currentState = state;

    await this.setUserData(state);
    return state;
  }

  private reset() {
    return this.set(this.defaultState);
  }

  save(partial: Partial<State>) {
    return this.get().then((current = this.defaultState) =>
      this.set(Object.assign({}, current, partial))
    );
  }
}
