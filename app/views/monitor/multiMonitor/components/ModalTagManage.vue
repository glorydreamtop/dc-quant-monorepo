<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModel"
    title="标签管理"
    :canFullscreen="false"
    :height="270"
    @ok="handleSubmit"
  >
    <div class="w-full p-2 overflow-auto">
      <div
        class="tag-box mb-12px"
        v-for="item in tagAll"
        :key="item.value"
        :class="{ cur: isTagCur(item.value) }"
        @click.self="handleClickTag(item.value)"
        >{{ item.label
        }}<div class="del" @click="handleTagDel(item.value)"><CloseCircleOutlined /></div
      ></div>
      <div class="w-120px inline-block align-bottom mb-12px">
        <InputSearch v-model:value="tagName" @search="handleAddTag">
          <template #enterButton> <PlusCircleOutlined class="text-lg" /> </template></InputSearch
      ></div>
    </div>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { CloseCircleOutlined, PlusCircleOutlined } from '@ant-design/icons-vue';
  import { Input } from 'ant-design-vue';

  export default defineComponent({
    components: { BasicModal, CloseCircleOutlined, PlusCircleOutlined, InputSearch: Input.Search },
    emits: ['on-tags-edit'],
    setup(_, { emit }) {
      const { createMessage, createConfirm } = useMessage();
      const [registerModel, { closeModal }] = useModalInner(() => {});
      const tagAll = ref([
        { label: '现货', value: '现货' },
        { label: '库存', value: '库存' },
        { label: '利润', value: '利润' },
      ]);
      const curTagList: any = ref(['现货', '库存', '利润']);
      const isTagCur = (value) => {
        if (curTagList.value.indexOf(value) == -1) {
          return false;
        } else {
          return true;
        }
      };
      const tagName = ref('');
      const handleClickTag = async (value) => {
        const index = curTagList.value.indexOf(value);
        if (index == -1) {
          curTagList.value.push(value);
        } else {
          curTagList.value.splice(index, 1);
        }
      };
      const handleTagDel = (value) => {
        createConfirm({
          iconType: 'warning',
          okButtonProps: {
            danger: true,
          },
          content: '确定删除该标签吗？',
          onOk: () => {
            tagAll.value = tagAll.value.filter((item) => item.value !== value);
            curTagList.value = curTagList.value.filter((item) => item !== value);
          },
        });
      };
      const handleAddTag = () => {
        if (tagName.value == '') {
          createMessage.warn('请填写标签名称');
          return;
        }
        tagAll.value.push({ label: tagName.value, value: tagName.value });
        tagName.value = '';
      };
      const handleSubmit = () => {
        const tags = tagAll.value.filter((item) => {
          let index = curTagList.value.findIndex((cur) => cur == item.value);
          return index !== -1;
        });
        emit('on-tags-edit', tags);
        closeModal();
      };
      return {
        registerModel,
        tagAll,
        isTagCur,
        handleClickTag,
        handleTagDel,
        tagName,
        handleAddTag,
        handleSubmit,
      };
    },
  });
</script>
<style scoped lang="less">
  .tag-box {
    position: relative;
    display: inline-block;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-size: 15px;
    color: #666;
    padding: 3px 10px;
    margin-right: 12px;
    cursor: pointer;

    .del {
      position: absolute;
      display: none;
      width: 8px;
      height: 8px;
      top: -10px;
      right: -0px;
      color: red;
    }

    &:hover {
      @apply text-primary;

      .del {
        display: block;
      }
    }

    &.cur {
      @apply bg-primary border border-primary;
      color: #fff;
    }
  }
</style>
