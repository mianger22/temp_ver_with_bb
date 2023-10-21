import React, { ReactNode, useEffect, useState } from 'react';
import { Modal, Input } from 'antd';
import {
  ProFormSelect,
  ProFormText,
  StepsForm,
  ProFormDateTimePicker,
  ProFormDigit,
} from '@ant-design/pro-form';
import { useIntl, FormattedMessage } from 'umi';
import type { CureListItem, CureToothPlanItem, CureToothItem } from '../data.d';
import ToothMap from '@/components/ToothMap/ToothMap';
import { AvailableListData } from '@/pages/directory/available/data';
import UploadDragger from '@/components/ImageUploader';
import { UserToothItem } from '@/pages/User/list/data';
import request from '@/utils/request';
import getTooths from '@/components/Common/GetTooths';

export type FormValueType = {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
} & Partial<CureListItem>;

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: CureListItem) => Promise<void>;
  updateModalVisible: boolean;
  values: Partial<CureListItem>;
  availables: AvailableListData[],
  healths: any[],
  nerves: any[],
  pacientsList: any[],
  usId?: string
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const [toothsHave, setToothsHave] = useState(false)
  const [selectedUser, setSelectedUser] = useState(false)
  const [selectedTths, setSelectedTths] = useState([])
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([])
  const [userToothMap, setUserToothMap] = useState([])
  const [stamp, setStamp] = useState(new Date())
  const [selectedTeethField, setSelectedTeethFields] = useState<ReactNode[]>([])
  const [selectedIniitalValues, setselectedIniitalValues] = useState({})
  const [resultVisible, setResultVisible] = useState<boolean>(false)
  const [resultText, setResultText] = useState<string>("")
  const [resultCure, setResultCure] = useState<UserToothItem[]>(props.values.result_cure)
  const intl = useIntl();

  const selectFn = (position: number, state: boolean): boolean => {
    if (selectedTeeth.indexOf(position) > -1 && !state) {
      setSelectedTeeth(selectedTeeth.filter(x => x != position))
      return true
    }
    if (selectedTeeth.indexOf(position) == -1 && state) {
      var v = [...selectedTeeth];
      v.push(position)
      setSelectedTeeth(v)
      return true
    }
    return false
  }

  useEffect(() => {
    // отмечаем, что пользователь выбран, чтобы отобразился зубной план на 2 этапе - ибо это форма обновления, а тут по-любому юзер выбран
    setSelectedUser(true);

    // console.clear();
    console.log("props in UpdateForm:", props);

    let vals = props.values;

    // если 

    if (vals.result_text && vals.result_text !== "") {
      setResultText(vals.result_text);
    } else {
      setResultText("");
    }

    if (vals.stamp && vals.stamp.getTime() < Date.now()) {
      setResultVisible(true);
    }

    let resultatCure: any = new Array(vals.result_cure);
    //if (vals.tooths && vals.tooths.length > 0) {

    // создаём переменную для хранения зубов
    let isHavedTooths: any;
      
    if (resultatCure[0]) {
      // заносим отмеченные зубы
      isHavedTooths = resultatCure[0].filter((cure: any) => cure.health_ids.length > 0);
    }
    //resultatCure.filter((cure: any) => cure.health_ids.length > 0).length === 0

    if (vals.tooths && vals.result_cure && isHavedTooths.length === 0) {
      (async () => {  
        let th: any = 0;
        for (let i = 0; i < vals.tooths.length; i++) {
          if (vals.tooths[i].health_ids.length > 0) {
            th = 1;
          }
        }

        if (th === 1) {
          setUserToothMap(vals.tooths);
        } else {
         (async function() {
            const tooth_map = await request(`/api/v1/dentistry/map/${vals.user_id}`);
            setUserToothMap(tooth_map.result.tooths);
            setToothsHave(true);
            // setUserToothMap(vals.tooths);
         })()
        }

        if (vals.result_cure.length == 0) {
          setResultCure(vals.tooths)
        } else {
          var r = vals.tooths.map((x: UserToothItem) => {
            var in_result = vals.result_cure.find((j: CureToothItem) => j.position == x.position)
            if(!in_result) {
              return x
            } 
            return in_result
          })
          setResultCure(r)
        }
      })()
    } else if (vals.result_cure && isHavedTooths && isHavedTooths.length > 0) {
      (async function() {
        const tooth_map = await request(`/api/v1/dentistry/map/${vals.user_id}`);
        setUserToothMap(tooth_map.result.tooths);
        setToothsHave(true);
      })();
   }

    if (vals.plan_cure) {
      var s = vals.plan_cure.map((x: CureToothPlanItem) => x.position)
      setSelectedTeeth(s)
      var init = vals.plan_cure.reduce((a: any, x: CureToothPlanItem) => {
        a[`plan_cure_tooth_${x.position}`] = x.description
        return a
      }, {})
      setselectedIniitalValues(init)
    }
  }, [props])

  useEffect(() => {
    var v = selectedTeeth.map(x => {
      return <ProFormText
        disabled={resultVisible}
        name={`plan_cure_tooth_${x}`}
        key={`plan_cure_tooth_${x}`}
        label={`Описание по зубу ${x}`}
      />
    })
    setSelectedTeethFields(v)
  }, [selectedTeeth])

  useEffect(() => {
    return () => {
      // console.log("cleaned up");
    };
  }, []);

  return (
      <StepsForm
        stepsProps={{
          size: 'small',
        }}
        stepsFormRender={(dom, submitter) => {
          return (
            <Modal
              width={800}
              bodyStyle={{ padding: '32px 40px 48px' }}
              destroyOnClose
              title={intl.formatMessage({
                id: 'pages.searchTable.updateForm.ruleConfig',
                defaultMessage: '规则配置',
              })}
              visible={props.updateModalVisible}
              footer={submitter}
              onCancel={(e) => {
                if (e.currentTarget.className === "ant-modal-close") {
                  // когда кликнули только по крестику
                  props.onCancel();
                } 
              }}
            >
              {dom}
            </Modal>
          );
        }}
        onFinish={async (values: any) => {
          var props_ = Object.getOwnPropertyNames(values)
          var plan = props_.filter(x => /plan_cure_tooth/.test(x)).map(x => {
            return {
              "position": x.split("_").filter(x => !isNaN(parseInt(x))).map(x => parseInt(x))[0],
              "description": values[x]
            }
          })

          let clearMap: any;

          if (toothsHave === true) {
            clearMap = userToothMap.map((el: any) => {
               return {
                  available_id: el.available_id,
                  health_ids: [],
                  nerve_id: el.nerve_id,
                  position: el.position
               }
            })
           } else {
            clearMap = resultCure.map((el: any) => {
              return {
                 available_id: el.available_id,
                 health_ids: [],
                 nerve_id: el.nerve_id,
                 position: el.position
              }
           })
           }
// alert("hhhh")
          //  console.clear()
           console.log("clearMap =", clearMap)

           localStorage.removeItem("updatedCure");

          const result: CureListItem = {
            user_id: typeof values.user_name === "number" ? values.user_name : props.values.user_id,
            stamp: new Date(values.stamp || props.values.stamp).toISOString(),
            name: values.name || props.values.name,
            plan_cure: resultVisible ? [] : (plan || props.values.plan_cure),
            rentgen: values.rentgen || props.values.rentgen,
            result_cure: toothsHave === true ? userToothMap : resultCure,
            // result_cure: clearMap,
            cost: parseFloat(values.cost) || props.values.cost,
            cost_with_discount: parseFloat(values.cost_with_discount) || props.values.cost_with_discount,
            doctor: values.doctor || props.values.doctor,
            diagnose: values.diagnose || props.values.diagnose,
            step: values.step || props.values.step,
            result_text: values.result_text || props.values.result_text
          }

          console.log("result =", result)
          
          // console.clear();
          // console.log("result to end in UpdForm: ", result);
          props.onSubmit(result);
        }}
      >
        <StepsForm.StepForm title="Общая информация" initialValues={props.values}>
          <ProFormText
            label="Название процедуры"
            width="md"
            name="name"
            rules={[{ required: true }]}
          />
          <ProFormDateTimePicker
            proFieldProps={{
            render:()=>{
              return "123"
            }
            }}
            label="Дата приема"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.user.ruleName"
                    defaultMessage="Rule name is required"
                  />
                ),
              },
            ]}
            width="md"
            name="stamp"
          />
          <ProFormText
            label="Врач"
            width="md"
            name="doctor"
            rules={[{ required: true }]}
          />
          <ProFormSelect
            showSearch
            label="Пациент"
            width="md"
            name="user_name"
            rules={[{ required: true }]}
            placeholder="Выберите значение"
            request={async () => await props.pacientsList}
          />
        </StepsForm.StepForm>
        <StepsForm.StepForm title="План лечения" initialValues={selectedIniitalValues}>
          <ToothMap
            availables={props.availables}
            healths={props.healths}
            nerves={props.nerves}
            data={userToothMap}
            canEdit={false}
            selected={selectedTeeth}
            // selectFn={resultVisible ? () => { return false } : selectFn}
            selectFn={selectFn}
            toothsDescription={props.values.plan_cure}
            showTemporaryDescriptions={true}
            usId={props.usId}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
          {selectedTeethField}
        </StepsForm.StepForm>
        <StepsForm.StepForm title="Диагноз" initialValues={props.values}>
          <ProFormText
            label={"Диагноз"}
            name="diagnose"
          />
          <ProFormText
            label={"Этап"}
            name="step"
          />
        </StepsForm.StepForm>
        <StepsForm.StepForm title="Стоимость" initialValues={props.values}>
          <ProFormDigit
            label={"Стоимость"}
            name="cost"
          />
          <ProFormDigit
            label={"Стоимость со скидкой"}
            name="cost_with_discount"
          />
        </StepsForm.StepForm>
        {resultVisible && <StepsForm.StepForm title={"Рентген"} initialValues={{ "rentgen": props.values.rentgen }}>
          <UploadDragger name="rentgen" />
        </StepsForm.StepForm>}
        { resultVisible &&
          <StepsForm.StepForm title="Результат">
            <ToothMap
              data={toothsHave === true ? userToothMap : resultCure}
              // data={userToothMap}
              availables={props.availables}
              healths={props.healths}
              nerves={props.nerves}
              // canEdit={props.values.result_cure && props.values.result_cure.length == 0}
              canEdit={true}
              selected={props.values.plan_cure ? props.values.plan_cure.map((x: UserToothItem) => x.position) : []}
              selectFn={() => { return false }}
              onChange={(position, available, healths, nerve) => {
                (async function () {
                  let cure;
                  const updatedCure = localStorage.getItem("updatedCure");

                  if (props.usId) {
                    if (!updatedCure) {
                      const intermediateData: any = await getTooths(props.usId);
                      cure = [...intermediateData];
                    } else {
                      const intermediateData: any = JSON.parse(updatedCure);
                      cure = [...intermediateData];
                    }
                  } else {
                    cure = [...resultCure];
                  }
                  
                  const tooth = cure.find(x => x.position == position);

                  if (tooth) {
                    // меняет зубной план, внедряя в него отмеченные зубы
                    tooth.available_id = available;
                    tooth.health_ids = healths;
                    tooth.nerve_id = nerve;

                    localStorage.setItem("updatedCure", JSON.stringify(cure));

                    setResultCure(cure);
                    setToothsHave(false);
                  } else {
                    cure.push({
                      position,
                      available_id: available,
                      health_ids: [],
                      nerve_id: nerve
                    })
                    setResultCure(cure)
                  }
                })()
              }}
              toothsDescription={props.values.plan_cure}
              showTemporaryDescriptions={true}
              usId={props.usId}
              toothsHave={toothsHave === false ? "false" : "true"}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
            />
            <ProFormText
              label="Описание"
              width="md"
              name="result_text"
              rules={[{ required: true }]}
            >
              <Input 
                defaultValue={resultText} 
                placeholder="Напишите заключение"
              />
            </ProFormText>
          </StepsForm.StepForm>}
      </StepsForm>
  );
};

export default UpdateForm;