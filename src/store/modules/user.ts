import { defineStore } from 'pinia';
import { UserState } from './types';

import { localStorage } from '@/utils/storage';
import { loginApi, logoutApi } from '@/api/auth';
import { getUserInfo } from '@/api/user';
import { resetRouter } from '@/router';
import { LoginForm } from '@/api/auth/types';

const useUserStore = defineStore({
  id: 'user',
  state: (): UserState => ({
    token: localStorage.get('token') || '',
    nickname: '',
    avatar: '',
    roles: [],
    perms: []
  }),
  actions: {
    async RESET_STATE() {
      this.$reset();
    },
    login(data: LoginForm) {
      const { username, password } = data;
      return new Promise((resolve, reject) => {
        loginApi({
          grant_type: 'password',
          username: username.trim(),
          password: password
        })
          .then(response => {
            console.log('response.data', response.data);
            const accessToken = response.data;
            localStorage.set('token', accessToken);
            this.token = accessToken;
            resolve(accessToken);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    getUserInfo() {
      return new Promise((resolve, reject) => {
        getUserInfo()
          .then(({ data }) => {
            if (!data) {
              return reject('Verification failed, please Login again.');
            }
            const { nickname, avatar, roles, perms } = data;
            if (!roles || roles.length <= 0) {
              reject('getUserInfo: roles must be a non-null array!');
            }
            this.nickname = nickname;
            this.avatar = avatar;
            this.roles = roles;
            this.perms = perms;
            resolve(data);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    logout() {
      return new Promise((resolve, reject) => {
        logoutApi()
          .then(() => {
            localStorage.remove('token');
            this.RESET_STATE();
            resetRouter();
            resolve(null);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    resetToken() {
      return new Promise(resolve => {
        localStorage.remove('token');
        this.RESET_STATE();
        resolve(null);
      });
    }
  }
});

export default useUserStore;
