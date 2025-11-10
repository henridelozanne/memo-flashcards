<template>
  <div class="background-effects">
    <!-- Ellipse 1 -->
    <div class="ellipse ellipse-1"></div>
    <!-- Ellipse 3 -->
    <div class="ellipse ellipse-3"></div>
    <!-- Ellipse 12 -->
    <div class="ellipse ellipse-12"></div>
    <!-- Ellipse 11 -->
    <div class="ellipse ellipse-11"></div>
    <!-- Ellipse 2 -->
    <div class="ellipse ellipse-2"></div>
    <!-- Ellipse 4 -->
    <div class="ellipse ellipse-4"></div>
  </div>
</template>

<style scoped>
.background-effects {
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  opacity: 0.8;
  pointer-events: none;
  overflow: hidden;
}

.ellipse {
  position: absolute;
  border-radius: 50%;
  filter: blur(75px);
}

.ellipse-1 {
  width: 60px;
  height: 60px;
  left: 70%;
  top: 30%;
  background: linear-gradient(180deg, #7c46f0 0%, rgba(124, 70, 240, 0.15) 100%);
}

.ellipse-3 {
  width: 96px;
  height: 96px;
  left: -5%;
  top: 65%;
  background: linear-gradient(180deg, #46bdf0 0%, rgba(70, 179, 240, 0.15) 100%);
}

.ellipse-12 {
  width: 74px;
  height: 74px;
  left: 20%;
  top: 25%;
  background: linear-gradient(180deg, #5f27ff 0%, #cab8ff 100%);
}

.ellipse-11 {
  width: 58px;
  height: 58px;
  left: 50%;
  top: 90%;
  background: linear-gradient(180deg, #f0b646 0%, rgba(240, 203, 70, 0.15) 100%);
  filter: blur(65px);
}

.ellipse-2 {
  width: 70px;
  height: 70px;
  left: -3%;
  top: -2%;
  background: linear-gradient(180deg, #46f080 0%, rgba(70, 240, 138, 0.15) 100%);
}

.ellipse-4 {
  width: 118px;
  height: 118px;
  left: 60%;
  top: 40%;
  background: linear-gradient(180deg, #edf046 0%, rgba(240, 233, 70, 0.15) 100%);
}
</style>
