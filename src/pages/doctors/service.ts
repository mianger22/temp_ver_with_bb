import request from '@/utils/request';
import type { UserListParams, UserListItem } from './data.d';

export async function queryUsers(params?: UserListParams) {
  // получаем имя из поиска
  let searchName = params?.name && params.name;
  // получаем телефон из поиска
  let searchPhone = params?.phone && params.phone;
  // получаем почту из поиска
  let searchEmail = params?.email && params.email;

  // let response = await request('/api/v1/doctors/page?filter={"is_admin": true}', {
  //   params,
  // });

  // ATTENTION!!! Выводится список всех докторов на главной странице
  const doctorsList = await request('/api/v1/doctors/');

  if (doctorsList.error === false) {
    let doctors: object[] = [];

    for (let index in doctorsList.result.items) {
      let doctor: UserListItem = doctorsList.result.items[index];

      // получаем наименование
      let designation = doctor.surname + " " + doctor.name;
      // получаем телефон пользователя
      let userPhone = doctor.phone;
      // получаем почту пользователя
      let userEmail = doctor.email;

      if (!searchName && !searchPhone && !searchEmail) {
        const tooth_map = await request(`/api/v1/dentistry/map/${doctor.id}`)
  
        if (tooth_map.error === false) {
          doctor.tooths = tooth_map.result.tooths
        }
  
        doctors.push(doctor)
      } else if (searchName && designation && designation.indexOf(searchName) >= 0 === true) {
        const tooth_map = await request(`/api/v1/dentistry/map/${doctor.id}`)
  
        if (tooth_map.error === false) {
          doctor.tooths = tooth_map.result.tooths
        }

        doctors.push(doctor)
      } else if (searchPhone && userPhone && userPhone.indexOf(searchPhone) >= 0 === true) {
        const tooth_map = await request(`/api/v1/dentistry/map/${doctor.id}`)
  
        if (tooth_map.error === false) {
          doctor.tooths = tooth_map.result.tooths
        }

        doctors.push(doctor)
      } else if (searchEmail && userEmail && userEmail.indexOf(searchEmail) >= 0 === true) {
        const tooth_map = await request(`/api/v1/dentistry/map/${doctor.id}`)
    
        if (tooth_map.error === false) {
          doctor.tooths = tooth_map.result.tooths
        }
    
        doctors.push(doctor)
      }
    }
      
    return {
      data: doctors,
      success: true,
      total: doctorsList.result.length
    }
  }

  return []
}

export async function removeUser(params: { user_id: string[] }) {
  // удаляем пользователя 
  return request('/api/v1/admin/user', { method: 'DELETE', data: {'user_id': params.user_id[0]}});
}

export async function addUser(params: UserListItem) {
  return request('/api/v1/dentistry/cure/', {
    method: 'POST',
    data: {
      ...params
    },
  });
}

export async function updateUser(params: UserListParams) {
  // делаем из пользователя админа
  const body = {"user_id": params.userId, "is_admin": params.is_admin};

  const result = await request('/api/v1/admin/user', {method: 'PATCH', data: body });
  
  return result;
}