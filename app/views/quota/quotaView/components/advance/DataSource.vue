<script lang="tsx">
  import { Radio, InputNumber, Input, Tag, Select, Tooltip, Button } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    echartMitter,
    useChartConfigContext,
    useSettingFilter,
    useSortMonthAndYear,
  } from '../hooks';
  import { BasicHelp } from '/@/components/Basic';
  import { structuralOffsetUnitEnum } from '/@/enums/chartEnum';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { uniq, remove } from 'lodash-es';
  import { toRaw, watch, reactive, defineComponent, unref, ref } from 'vue';
  import { quotaDataPastUnitTypeEnum } from '@dq-next/http-apis/quota';
  import { EChartsOption, LineSeriesOption } from 'echarts';
  import {
    normalChartConfigType,
    quantileRadarChartConfigType,
    structuralChartConfigType,
  } from '/#/chart';

  export default defineComponent({
    setup() {
      const { createMessage } = useMessage();
      const { t } = useI18n();
      const RadioGroup = Radio.Group;
      const RadioButton = Radio.Button;
      const TextArea = Input.TextArea;
      const chartConfig = useChartConfigContext();
      const showSettingFilter = useSettingFilter(chartConfig);
      // 校验曲线结构日期偏移量输入值
      function offsetChange(e: ChangeEvent) {
        if (/[^(\d|,)]/g.test(e.target.value)) {
          e.target.style.borderColor = 'red';
          createMessage.error(t('common.invaildTextTip'));
          return;
        }
        const arr = e.target.value.split(',');
        if (uniq(arr).length !== arr.length) {
          createMessage.error(t('common.notUniqTip'));
          return;
        }
        e.target.style.borderColor = '';
      }
      const datasourceSetting = reactive({
        pastValue: 0,
        pastUnit: quotaDataPastUnitTypeEnum.last,
      });
      watch(
        () => {
          return chartConfig.timeConfig;
        },
        (v) => {
          if (v.pastValue !== undefined && v.pastUnit !== undefined) {
            datasourceSetting.pastValue = v.pastValue;
            datasourceSetting.pastUnit = v.pastUnit;
          }
          updateYears();
        },
        {
          deep: true,
        },
      );
      watch(
        datasourceSetting,
        (v) => {
          if (v.pastValue > 0) {
            Object.assign(chartConfig.timeConfig, toRaw(datasourceSetting));
          } else {
            chartConfig.timeConfig.pastUnit = undefined;
            chartConfig.timeConfig.pastValue = undefined;
          }
        },
        { deep: true },
      );
      const pastUnitList = [
        {
          label: quotaDataPastUnitTypeEnum.last,
          value: quotaDataPastUnitTypeEnum.last,
        },
        {
          label: quotaDataPastUnitTypeEnum.day,
          value: quotaDataPastUnitTypeEnum.day,
        },
        {
          label: quotaDataPastUnitTypeEnum.month,
          value: quotaDataPastUnitTypeEnum.month,
        },
      ];
      // 年份月份过滤
      const [
        { monthList, yearList },
        { sortMonthChange, startMonthChange, sortYearChange, updateYears },
      ] = useSortMonthAndYear(chartConfig);

      function renderPastValue() {
        return (
          <span class="flex items-center gap-1">
            <span>{t('quotaView.advance.datasourceSetting.past')}</span>
            <InputNumber
              size="small"
              min={0}
              class="!w-14 !min-w-14"
              v-model:value={datasourceSetting.pastValue}
            />
            <RadioGroup
              button-style="solid"
              size="small"
              v-model:value={datasourceSetting.pastUnit}
            >
              {pastUnitList.map((item) => (
                <RadioButton value={item.value}>{item.label}</RadioButton>
              ))}
            </RadioGroup>
            <BasicHelp text={t('quotaView.advance.datasourceSetting.tip')} />
          </span>
        );
      }
      function renderStartMonth() {
        return (
          <>
            <span>,{t('quotaView.advance.datasourceSetting.startMonth')}</span>
            <Input
              class="!w-18 ml-1"
              size="small"
              addon-after="月"
              v-model:value={chartConfig.timeConfig.startMonth}
              onBlur={startMonthChange}
            />
          </>
        );
      }
      function renderSortMonth() {
        return (
          <div class="p-2 bg-gray-100 rounded-sm">
            <span class="flex items-center text-primary">
              <span>{t('quotaView.advance.datasourceSetting.sortMonth')}</span>
              {showSettingFilter('startMonth') && renderStartMonth()}
            </span>
            <div class="grid grid-cols-6 grid-rows-2 gap-2 mt-2" onClick={sortMonthChange}>
              {unref(monthList).map((month) => (
                <div
                  data-month={month}
                  class={[
                    chartConfig.timeConfig.sortMonth!.includes(month)
                      ? 'bg-white text-primary'
                      : 'bg-primary text-white',
                    'w-full text-center rounded-sm month cursor-pointer',
                  ]}
                  key={month}
                >
                  {month + t('quotaView.advance.datasourceSetting.pastUnit.month')}
                </div>
              ))}
            </div>
          </div>
        );
      }
      function renderSortYear() {
        return (
          <div
            class="flex flex-wrap gap-2 pt-2 mt-2 border-t border-t-gray-400"
            onClick={sortYearChange}
          >
            {unref(yearList).map((year) => (
              <div
                data-year={year}
                class={[
                  chartConfig.timeConfig.sortYear!.includes(year)
                    ? 'bg-white text-primary'
                    : 'bg-primary text-white',
                  'flex-grow min-w-40px max-w-80px text-center rounded-sm month cursor-pointer',
                ]}
                key={year}
              >
                {year}
              </div>
            ))}
          </div>
        );
      }
      function renderStructuralOffset() {
        return (
          <div class="p-2 bg-gray-100 rounded-sm">
            <span class="text-primary">
              {t('quotaView.advance.datasourceSetting.structuralOffset')}
            </span>
            <div class="flex items-center gap-2">
              <Input
                size="small"
                class="!w-30 !min-w-30"
                v-model:value={(chartConfig as structuralChartConfigType).structuralOffset}
                onChange={offsetChange}
              />
              <RadioGroup
                button-style="solid"
                size="small"
                v-model:value={(chartConfig as structuralChartConfigType).structuralOffsetUnit}
              >
                <RadioButton value={structuralOffsetUnitEnum.tradingDay}>
                  {t('common.tradingDay')}
                </RadioButton>
                <RadioButton value={structuralOffsetUnitEnum.natureDay}>
                  {t('common.natureDay')}
                </RadioButton>
              </RadioGroup>
              <BasicHelp text={t('quotaView.advance.datasourceSetting.structuralOffsetUnit')} />
            </div>
          </div>
        );
      }
      function renderQuantileOffset() {
        return (
          <div class="p-2 bg-gray-100 rounded-sm">
            <span class="text-primary">
              {t('quotaView.advance.datasourceSetting.quantileOffset')}
            </span>
            <div class="flex items-center gap-2">
              <Input
                size="small"
                class="!w-30 !min-w-30"
                v-model:value={(chartConfig as quantileRadarChartConfigType).quantileOffset}
                onChange={offsetChange}
              />
              <BasicHelp text={t('quotaView.advance.datasourceSetting.structuralOffsetTip')} />
            </div>
          </div>
        );
      }
      // 智能抹去数据点
      const removePoint = reactive({
        xRange: '',
        seriesName: '',
      });
      const seriesOptions = ref<{ label: any; value: any }[]>([]);
      echartMitter.on('echartOptions', (options: EChartsOption) => {
        seriesOptions.value = (options.series as LineSeriesOption[]).map((ser) => {
          return {
            label: ser.name,
            value: ser.name,
          };
        });
      });
      function addFilterGroup() {
        const list = (chartConfig as normalChartConfigType).removePoint ?? [];
        const repeat = list.some(
          (item) =>
            item.seriesName === removePoint.seriesName && item.xRange === removePoint.xRange,
        );
        if (repeat) {
          createMessage.warn(t('common.notUniqTip'));
          return;
        }
        list.push({
          seriesName: removePoint.seriesName,
          xRange: removePoint.xRange,
        });
        (chartConfig as normalChartConfigType).removePoint = list;
      }
      function delFilterGroup(group: any) {
        remove(
          (chartConfig as normalChartConfigType).removePoint!,
          (item) => item.xRange === group.xRange && item.seriesName === group.seriesName,
        );
      }
      function renderRemovePoint() {
        return (
          <div class="grid gap-2 bg-gray-100 p-2">
            <div class="label">
              <span>{t('quotaView.advance.dataEdit.removePoint')}</span>
              <BasicHelp text={t('quotaView.advance.dataEdit.xTip')} />
            </div>
            <div class="label">
              <div class="min-w-4em">{t('quotaView.advance.dataEdit.xFilter')}</div>
              <TextArea v-model:value={removePoint.xRange} />
            </div>
            <div class="label">
              <div class="min-w-4em">{t('quotaView.advance.dataEdit.seriesFilter')}</div>
              <Select
                placeholder={t('quotaView.advance.dataEdit.seriesTip')}
                class="flex-grow"
                v-model:value={removePoint.seriesName}
                options={seriesOptions}
              />
              <Button type="primary" onClick={addFilterGroup}>
                {t('quotaView.advance.dataEdit.addBtn')}
              </Button>
            </div>
            <div class="items-baseline label">
              <div class="min-w-4em">{t('quotaView.advance.dataEdit.filterGroup')}</div>
              <div class="!children:mb-3">
                {(chartConfig as normalChartConfigType).removePoint?.map((item) => (
                  <span key={`${item.seriesName}${item.xRange}`}>
                    <Tooltip placement="left">
                      {{
                        title: () => <span>{item.xRange}</span>,
                        default: () => (
                          <Tag closable onClose={delFilterGroup.bind(null, item)}>
                            {item.seriesName}
                          </Tag>
                        ),
                      }}
                    </Tooltip>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      }
      return () => (
        <div class="flex flex-col gap-2 pl-8">
          {showSettingFilter('pastValue') && renderPastValue()}
          {showSettingFilter('sortMonth') && renderSortMonth()}
          {showSettingFilter('sortYear') && renderSortYear()}
          {showSettingFilter('structuralOffset') && renderStructuralOffset()}
          {showSettingFilter('quantileOffset') && renderQuantileOffset()}
          {showSettingFilter('removePoint') && renderRemovePoint()}
        </div>
      );
    },
  });
</script>

<style lang="less" scoped>
  .month {
    transition: all 0.3s ease;
  }
</style>
