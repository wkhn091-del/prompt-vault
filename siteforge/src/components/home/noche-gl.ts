import { PIECE_SCREEN, PIECE_U } from "./noche-assets";

const VERT = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_uv; // u in piece image space 0-1 of full street, v 0-1
uniform vec2 u_res;
uniform vec4 u_plate; // px, 0, pw, ph
uniform float u_offset;
uniform float u_pan;
uniform float u_u0;
uniform float u_u1;
uniform float u_mirrorPad; // extra mirrored width as fraction of piece (outer only)
out vec2 v_uv;
out float v_d;

void main(){
  float uSpan = u_u1 - u_u0;
  float u = mix(u_u0 - u_mirrorPad * uSpan, u_u1 + u_mirrorPad * uSpan, a_uv.x);
  float v = a_uv.y;
  float xf = u_plate.x + u * u_plate.z;
  float d = (xf - u_res.x * 0.5) / u_res.x;
  float r = min(0.32, 0.022 + 1.02 * pow(abs(d), 1.5));
  float x = xf + u_offset;
  float y = v * u_plate.w - u_pan * r * u_res.y;
  // clip space (y down in CSS → flip)
  float ndcX = (x / u_res.x) * 2.0 - 1.0;
  // Invert: with FLIP_Y textures, mapping CSS-y to +ndcY draws the street upright.
  float ndcY = (y / u_res.y) * 2.0 - 1.0;
  gl_Position = vec4(ndcX, ndcY, 0.0, 1.0);
  v_uv = vec2(u, v);
  v_d = d;
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_day;
uniform sampler2D u_night;
uniform float u_nightAmt;
out vec4 outColor;

void main(){
  float u = v_uv.x;
  float v = v_uv.y;
  // mirror outside 0-1
  if (u < 0.0) u = -u;
  if (u > 1.0) u = 2.0 - u;
  u = clamp(u, 0.0, 1.0);
  v = clamp(v, 0.0, 1.0);
  vec3 day = texture(u_day, vec2(u, v)).rgb;
  float shift = 0.0016 * clamp((0.87 - u) / 0.37, 0.0, 1.0);
  vec3 night = texture(u_night, vec2(clamp(u + shift, 0.0, 1.0), v)).rgb;
  outColor = vec4(mix(day, night, u_nightAmt), 1.0);
}`;

export type PieceRuntime = {
  id: string;
  u0: number;
  u1: number;
  screenX0: number;
  screenX1: number;
  travel: number; // px toward centre
  sign: number; // +1 left pieces (start offset +x), -1 right
  mirrorPad: number;
  offset: number; // current px offset
};

export function buildPieces(W: number): PieceRuntime[] {
  return PIECE_U.map((p, i) => {
    const s = PIECE_SCREEN[i]!;
    const c = (s.x0 + s.x1) / 2;
    const travel = Math.abs(c - 0.5) < 1e-6 ? 0 : 0.93 * Math.abs(c - 0.5) * W;
    const sign = c < 0.5 ? 1 : c > 0.5 ? -1 : 0;
    const outer = i === 0 || i === PIECE_U.length - 1;
    return {
      id: p.id,
      u0: p.u0,
      u1: p.u1,
      screenX0: s.x0,
      screenX1: s.x1,
      travel,
      sign,
      mirrorPad: outer ? 0.09 : 0,
      offset: sign * travel,
    };
  });
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) || "shader");
  }
  return sh;
}

export type GLStreet = {
  gl: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  draw: (
    pieces: PieceRuntime[],
    plate: { px: number; pw: number; ph: number },
    W: number,
    H: number,
    night: number,
    pan: number,
  ) => void;
  resize: (cssW: number, cssH: number, dpr: number) => void;
  destroy: () => void;
};

export function createGLStreet(
  canvas: HTMLCanvasElement,
  dayImg: HTMLImageElement,
  nightImg: HTMLImageElement,
): GLStreet | null {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: true,
    premultipliedAlpha: false,
  });
  if (!gl) return null;

  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog) || "link");
  }

  const COLS = 48;
  const verts: number[] = [];
  for (let row = 0; row < 2; row++) {
    for (let c = 0; c <= COLS; c++) {
      verts.push(c / COLS, row);
    }
  }
  // triangle strip indices: zigzag rows
  const idx: number[] = [];
  for (let c = 0; c < COLS; c++) {
    idx.push(c, c + COLS + 1, c + 1, c + 1, c + COLS + 1, c + COLS + 2);
  }

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);

  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

  function texFrom(img: HTMLImageElement) {
    const t = gl!.createTexture()!;
    gl!.bindTexture(gl!.TEXTURE_2D, t);
    // Align image top with mesh v=0 (screen top).
    gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, 1);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, img);
    gl!.generateMipmap(gl!.TEXTURE_2D);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR_MIPMAP_LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    return t;
  }

  const dayTex = texFrom(dayImg);
  const nightTex = texFrom(nightImg);

  const loc = {
    res: gl.getUniformLocation(prog, "u_res"),
    plate: gl.getUniformLocation(prog, "u_plate"),
    offset: gl.getUniformLocation(prog, "u_offset"),
    pan: gl.getUniformLocation(prog, "u_pan"),
    u0: gl.getUniformLocation(prog, "u_u0"),
    u1: gl.getUniformLocation(prog, "u_u1"),
    mirrorPad: gl.getUniformLocation(prog, "u_mirrorPad"),
    day: gl.getUniformLocation(prog, "u_day"),
    night: gl.getUniformLocation(prog, "u_night"),
    nightAmt: gl.getUniformLocation(prog, "u_nightAmt"),
  };

  return {
    gl,
    canvas,
    resize(cssW, cssH, dpr) {
      const w = Math.max(1, Math.floor(cssW * dpr));
      const h = Math.max(1, Math.floor(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      gl.viewport(0, 0, w, h);
    },
    draw(pieces, plate, W, H, night, pan) {
      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      gl.clearColor(0.922, 0.882, 0.843, 1); // #ebe1d7
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(loc.res, W, H);
      gl.uniform4f(loc.plate, plate.px, 0, plate.pw, plate.ph);
      gl.uniform1f(loc.pan, pan);
      gl.uniform1f(loc.nightAmt, night);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, dayTex);
      gl.uniform1i(loc.day, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, nightTex);
      gl.uniform1i(loc.night, 1);

      // inner first (E centre), then outward — draw order by |travel| ascending then reverse for outer on top
      const order = [...pieces].sort(
        (a, b) => Math.abs(a.travel) - Math.abs(b.travel),
      );
      for (const p of order) {
        gl.uniform1f(loc.offset, p.offset);
        gl.uniform1f(loc.u0, p.u0);
        gl.uniform1f(loc.u1, p.u1);
        gl.uniform1f(loc.mirrorPad, p.mirrorPad);
        gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      }
      // redraw outers last for z
      for (const p of [...pieces].sort((a, b) => Math.abs(a.travel) - Math.abs(b.travel)).reverse()) {
        if (Math.abs(p.travel) < 1) continue;
        gl.uniform1f(loc.offset, p.offset);
        gl.uniform1f(loc.u0, p.u0);
        gl.uniform1f(loc.u1, p.u1);
        gl.uniform1f(loc.mirrorPad, p.mirrorPad);
        gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      }
    },
    destroy() {
      gl.deleteTexture(dayTex);
      gl.deleteTexture(nightTex);
      gl.deleteProgram(prog);
    },
  };
}
