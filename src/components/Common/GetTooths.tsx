import request from "@/utils/request"

export default async function getTooths(uId: string) {
  const tooth_map = await request(`/api/v1/dentistry/map/${uId}`);
  return tooth_map.result.tooths;
}