function calculateAcceleration (speedAtA, speedAtB, ellapsedTime){
  let acc = (speedAtB - speedAtA) / ellapsedTime;
  return acc;
}
