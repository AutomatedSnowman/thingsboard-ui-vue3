<template>
  <CollapseContainer :title="t('Account Binding')" :canExpan="false">
    <List>
      <template v-for="item in accountBindList" :key="item.key">
        <List.Item>
          <List.Item.Meta>
            <template #avatar>
              <Icon v-if="item.avatar" class="avatar" :icon="item.avatar" :color="item.color" />
            </template>
            <template #title>
              {{ item.title }}
              <a-button
                type="link"
                size="small"
                v-if="item.extra"
                class="extra"
                @click="handleBind(item.title)"
              >
                {{ item.extra }}
              </a-button>
            </template>
            <template #description>
              <div>{{ item.description }}</div>
            </template>
          </List.Item.Meta>
        </List.Item>
      </template>
    </List>
  </CollapseContainer>
</template>
<script lang="ts" setup>
  import { List } from 'ant-design-vue';
  import { CollapseContainer } from '/@/components/Container';
  import Icon from '/@/components/Icon';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { t } = useI18n();
  const { showMessage } = useMessage();

  interface ListItem {
    key: string;
    title: string;
    description: string;
    extra?: string;
    avatar?: string;
    color?: string;
  }

  const accountBindList: ListItem[] = [
    {
      key: '1',
      title: t('BIND QQ'),
      description: t('Not bound to a QQ account.'),
      extra: t('Bind'),
      avatar: 'ant-design:qq-circle-filled',
      color: '#2eabff',
    },
    {
      key: '2',
      title: t('Bind WeChat'),
      description: t('Not bound to a WeChat account.'),
      extra: t('Bind'),
      avatar: 'ant-design:wechat-filled',
      color: '#2aae67',
    },
    {
      key: '3',
      title: t('Bind DingTalk'),
      description: t('Not bound to a DingTalk account.'),
      extra: t('Bind'),
      avatar: 'ant-design:dingtalk-circle-filled',
      color: '#1890ff',
    },
  ];

  function handleBind(title: string) {
    showMessage(title + '，' + t('common.notYetRealized'));
  }
</script>
<style lang="less">
  .avatar {
    font-size: 40px !important;
  }

  .extra {
    float: right;
    margin-top: 10px;
    margin-right: 30px;
    cursor: pointer;
  }
</style>
