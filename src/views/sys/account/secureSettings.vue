<template>
  <CollapseContainer :title="t('sys.account.securityTab')" :canExpan="false">
    <div class="jwt-conainer">
      <div class="text-base font-bold">JWT Token</div>
      <div class="flex items-start justify-between mt-4 mr-4">
        <div class="text-base text-slate-600">Token Valid Until {{ tokenExpireTime }}</div>
        <Button type="primary" @click="handleCopyJWT"> Copy JWT Token </Button>
      </div>
    </div>
    <div class="p4">
      <Row :gutter="24" class="mt-3">
        <Col :span="14">
          <div class="password-from-container">
            <div class="text-base font-bold mb-4">Change Password</div>
            <BasicForm @register="register" />
            <div class="mt-4 flex justify-center space-x-6">
              <Button :loading="submitLoading" @click="handleResetPassword">
                <Icon icon="ant-design:redo-outlined" /> Cancel
              </Button>
              <Button type="primary" :loading="submitLoading" @click="handleChangePassword">
                <Icon icon="i-ant-design:check-outlined" /> Cancel
              </Button>
            </div>
          </div>
        </Col>
        <Col :span="10">
          <div class="password-policy-container">
            <div class="text-base font-bold mb-4">Password Requirements</div>
            <ul>
              <li
                v-if="passwordPolicy?.minimumLength"
                :class="
                  policyChecked.minimumLength == true ? 'my-2 text-teal-500' : 'my-2 text-rose-500'
                "
              >
                <!-- <CheckIcon v-if="" /> -->
                <Icon
                  class="mr-2"
                  :icon="
                    policyChecked.minimumLength == true
                      ? 'ant-design:check-outlined'
                      : 'ant-design:close-outlined'
                  "
                />
                最少 {{ passwordPolicy?.minimumLength }} Characters
              </li>
              <li
                v-if="passwordPolicy?.maximumLength"
                :class="
                  policyChecked.maximumLength == true ? 'my-2 text-teal-500' : 'my-2 text-rose-500'
                "
              >
                <!-- <CheckIcon v-if="" /> -->
                <Icon
                  class="mr-2"
                  :icon="
                    policyChecked.maximumLength == true
                      ? 'ant-design:check-outlined'
                      : 'ant-design:close-outlined'
                  "
                />
                最多 {{ passwordPolicy?.maximumLength }} Characters
              </li>
              <li
                v-if="passwordPolicy?.minimumDigits"
                :class="
                  policyChecked.minimumDigits == true ? 'my-2 text-teal-500' : 'my-2 text-rose-500'
                "
              >
                <Icon
                  :icon="
                    policyChecked.minimumDigits == true
                      ? 'ant-design:check-outlined'
                      : 'ant-design:close-outlined'
                  "
                  class="mr-2"
                />
                最少 {{ passwordPolicy?.minimumDigits }} Digits
              </li>
              <li
                v-if="passwordPolicy?.minimumUppercaseLetters"
                :class="
                  policyChecked.minimumUppercaseLetters == true
                    ? 'my-2 text-teal-500'
                    : 'my-2 text-rose-500'
                "
              >
                <Icon
                  :icon="
                    policyChecked.minimumUppercaseLetters == true
                      ? 'ant-design:check-outlined'
                      : 'ant-design:close-outlined'
                  "
                  class="mr-2"
                />
                最少 {{ passwordPolicy?.minimumUppercaseLetters }} Uppercase Letters
              </li>
              <li
                v-if="passwordPolicy?.minimumLowercaseLetters"
                :class="
                  policyChecked.minimumLowercaseLetters == true
                    ? 'my-2 text-teal-500'
                    : 'my-2 text-rose-500'
                "
              >
                <Icon
                  :icon="
                    policyChecked.minimumLowercaseLetters == true
                      ? 'ant-design:check-outlined'
                      : 'ant-design:close-outlined'
                  "
                  class="mr-2"
                />
                最少 {{ passwordPolicy?.minimumLowercaseLetters }} Lowercase Letters
              </li>
              <li
                v-if="passwordPolicy?.minimumSpecialCharacters"
                :class="
                  policyChecked.minimumSpecialCharacters == true
                    ? 'my-2 text-teal-500'
                    : 'my-2 text-rose-500'
                "
              >
                <Icon
                  :icon="
                    policyChecked.minimumSpecialCharacters == true
                      ? 'ant-design:check-outlined'
                      : 'ant-design:close-outlined'
                  "
                  class="mr-2"
                />
                最少 {{ passwordPolicy?.minimumSpecialCharacters }} Special Characters
              </li>
              <li
                v-if="passwordPolicy?.allowWhitespaces == false"
                :class="
                  policyChecked.allowWhitespaces == true
                    ? 'my-2 text-teal-500'
                    : 'my-2 text-rose-500'
                "
              >
                <Icon
                  :icon="
                    policyChecked.allowWhitespaces == true
                      ? 'ant-design:check-outlined'
                      : 'ant-design:close-outlined'
                  "
                  class="mr-2"
                />
                不允许包含空格
              </li>
            </ul>
          </div>
        </Col>
      </Row>
    </div>
  </CollapseContainer>
</template>
<script lang="ts" setup>
  import { computed, ref, onMounted, reactive } from 'vue';
  import { jwtDecode } from 'jwt-decode';
  import { Icon } from '/@/components/Icon';
  import { copyToClipboard } from '/@/utils';
  import { CollapseContainer } from '/@/components/Container';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Button, Row, Col } from 'ant-design-vue';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { getRefreshToken } from '/@/utils/auth';
  import { getUserPasswordPolicy } from '/@/api/tb/noauth';
  import { PasswordPolicy } from '/@/api/tb/adminSetting';
  import { changePassword } from '/@/api/tb/auth';
  import dayjs from 'dayjs';

  const { t } = useI18n();
  const { showMessage } = useMessage();

  const tokenExpireTime = computed(() => {
    return dayjs.unix(jwtDecode(getRefreshToken() || '').exp || 0).format('YYYY-MM-DD HH:mm:ss');
  });

  function handleCopyJWT() {
    copyToClipboard(getRefreshToken() || '', 'Copied JWT Token！');
  }

  const submitLoading = ref(false);
  const passwordPolicy = ref<PasswordPolicy>();
  const policyChecked = reactive({
    minimumLength: false,
    maximumLength: true,
    minimumDigits: false,
    minimumUppercaseLetters: false,
    minimumLowercaseLetters: false,
    minimumSpecialCharacters: false,
    allowWhitespaces: false,
  });

  onMounted(async () => {
    passwordPolicy.value = await getUserPasswordPolicy();
  });

  const formSchema: FormSchema[] = [
    {
      field: 'currentPassword',
      label: t('sys.account.oldPassword'),
      component: 'InputPassword',
      colProps: { span: 18 },
      required: true,
    },
    {
      field: 'newPassword',
      label: t('sys.account.newPassword'),
      component: 'InputPassword',
      colProps: { span: 18 },
      dynamicRules: ({ values }) => {
        return [
          {
            required: true,
            validator: (_, value) => validateNewPassword(values, value),
            trigger: ['change', 'blur'],
          },
        ];
      },
    },
    {
      field: 'confirmPassword',
      label: t('sys.account.confirmNewPassword'),
      component: 'InputPassword',
      colProps: { span: 18 },
      dynamicRules: ({ values }) => {
        return [
          {
            required: true,
            validator: (_, value) => validateConfirmPassword(values, value),
            trigger: ['change', 'blur'],
          },
        ];
      },
    },
  ];

  const [register, { validate, resetFields }] = useForm({
    labelWidth: 100,
    showActionButtonGroup: false,
    schemas: formSchema,
  });

  function handleResetPassword() {
    resetFields();
    policyChecked.minimumDigits = false;
    policyChecked.maximumLength = true;
    policyChecked.minimumLength = false;
    policyChecked.allowWhitespaces = false;
    policyChecked.minimumLowercaseLetters = false;
    policyChecked.minimumUppercaseLetters = false;
    policyChecked.minimumSpecialCharacters = false;
  }

  async function handleChangePassword() {
    try {
      const data = await validate();
      submitLoading.value = true;
      // console.log('submit', params, data, record);
      const res = await changePassword({ ...data });
      showMessage('Password Changed！');
    } catch (error: any) {
      if (error && error.errorFields) {
        showMessage(t('common.validateError'));
      }
      console.log('error', error);
    } finally {
      submitLoading.value = false;
    }
  }

  function validateConfirmPassword(values: any, confirmPassword: string) {
    if (!confirmPassword) {
      return Promise.reject(t('sys.account.newPasswordNotBlank'));
    }
    if (confirmPassword !== values.newPassword) {
      return Promise.reject(t('sys.account.newPasswordNotEquals'));
    }
    return Promise.resolve();
  }

  function validateNewPassword(values: any, newPassword: string) {
    policyChecked.minimumDigits = false;
    policyChecked.maximumLength = true;
    policyChecked.minimumLength = false;
    policyChecked.allowWhitespaces = false;
    policyChecked.minimumLowercaseLetters = false;
    policyChecked.minimumUppercaseLetters = false;
    policyChecked.minimumSpecialCharacters = false;

    if (!newPassword) {
      return Promise.reject(t('sys.account.newPasswordNotBlank'));
    }
    if (newPassword == values.currentPassword) {
      return Promise.reject('The new password cannot be the same as the current password.');
    }

    if (passwordPolicy.value?.minimumLength) {
      if (newPassword.length < passwordPolicy.value.minimumLength) {
        return Promise.reject(`Password Minimum${passwordPolicy.value.minimumLength}Characters`);
      } else {
        policyChecked.minimumLength = true;
      }
    }
    if (passwordPolicy.value?.maximumLength) {
      if (newPassword.length > passwordPolicy.value.maximumLength) {
        policyChecked.maximumLength = false;
        return Promise.reject(`Password Maximum${passwordPolicy.value.maximumLength}Characters`);
      } else {
        policyChecked.maximumLength = true;
      }
    }
    if (passwordPolicy.value?.minimumDigits) {
      const digitsStr = newPassword.replace(/[^\d]/g, '');
      if (digitsStr.length < passwordPolicy.value.minimumDigits) {
        return Promise.reject(`The Password Must Contain${passwordPolicy.value.minimumDigits}Digits`);
      } else {
        policyChecked.minimumDigits = true;
      }
    }
    if (passwordPolicy.value?.minimumUppercaseLetters) {
      const uppercaseStr = newPassword.replace(/[^\A-Z]/g, '');
      if (uppercaseStr.length < passwordPolicy.value.minimumUppercaseLetters) {
        return Promise.reject(`The Password Must Contain${passwordPolicy.value.minimumUppercaseLetters}Uppercase Letters`,
        );
      } else {
        policyChecked.minimumUppercaseLetters = true;
      }
    }
    if (passwordPolicy.value?.minimumLowercaseLetters) {
      const lowercaseStr = newPassword.replace(/[^\a-z]/g, '');
      if (lowercaseStr.length < passwordPolicy.value.minimumLowercaseLetters) {
        return Promise.reject(
          `The Password Must Contain${passwordPolicy.value.minimumLowercaseLetters}Lowercase Letters`,
        );
      } else {
        policyChecked.minimumLowercaseLetters = true;
      }
    }
    if (passwordPolicy.value?.minimumSpecialCharacters) {
      const specialStr = newPassword.replace(/[a-zA-Z0-9]/g, '');
      if (specialStr.length < passwordPolicy.value.minimumSpecialCharacters) {
        return Promise.reject(
          `The Password Must Contain${passwordPolicy.value.minimumSpecialCharacters}Special Characters`,
        );
      } else {
        policyChecked.minimumSpecialCharacters = true;
      }
    }
    if (passwordPolicy.value?.allowWhitespaces == false) {
      if (newPassword.indexOf(' ') > -1) {
        return Promise.reject(`The Password Cannot Contain Spaces`);
      } else {
        policyChecked.allowWhitespaces = true;
      }
    }
    return Promise.resolve();
  }
</script>
<style lang="less">
  .jwt-conainer {
    padding: 1rem;
    border-bottom: 1px solid #d9d9d9;
  }
  .password-from-container {
    border-right: 1px solid #d9d9d9;
  }
  .password-policy-container {
  }
</style>
