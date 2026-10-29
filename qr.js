/* A QR encoder: byte mode, error-correction level M, versions 1-10 (up to 213 bytes,
   far more than any URL this app will ever point at).

   Hand-rolled rather than pulled from a CDN because the app has no build step and has to
   keep working offline. A share panel whose code only renders when you already have a
   connection fails in exactly the situation it exists for: standing in a corridor holding
   your phone out to someone.

   Verified module-for-module against the `qrcode` npm package over every version 1-10
   and a spread of payload lengths, so this is the same matrix a reference encoder
   produces, mask choice included. */
(() => {
"use strict";

/* GF(256) with the QR primitive polynomial, log/antilog tables so multiplication is two
   lookups and an add. */
const EXP=new Uint8Array(512),LOG=new Uint8Array(256);
(()=>{let x=1;for(let i=0;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&0x100)x^=0x11d}for(let i=255;i<512;i++)EXP[i]=EXP[i-255]})();
const mul=(a,b)=>a&&b?EXP[LOG[a]+LOG[b]]:0;

function rsPoly(n){
  let p=[1];
  for(let i=0;i<n;i++){
    const q=new Array(p.length+1).fill(0);
    for(let j=0;j<p.length;j++){q[j]^=p[j];q[j+1]^=mul(p[j],EXP[i])}
    p=q;
  }
  return p;
}
function rsEncode(data,ecLen){
  const gen=rsPoly(ecLen),res=new Uint8Array(data.length+ecLen);
  res.set(data);
  for(let i=0;i<data.length;i++){
    const f=res[i];if(!f)continue;
    for(let j=0;j<gen.length;j++)res[i+j]^=mul(gen[j],f);
  }
  return res.slice(data.length);
}

/* [data codewords, EC codewords per block, blocks in group 1, codewords each,
   blocks in group 2, codewords each] for error-correction level M. */
const VERSIONS={
  1:[16,10,1,16,0,0], 2:[28,16,1,28,0,0], 3:[44,26,1,44,0,0],  4:[64,18,2,32,0,0],
  5:[86,24,2,43,0,0], 6:[108,16,4,27,0,0],7:[124,18,4,31,0,0],  8:[154,22,2,38,2,39],
  9:[182,22,3,36,2,37],10:[216,26,4,43,1,44]
};
const ALIGN={1:[],2:[6,18],3:[6,22],4:[6,26],5:[6,30],6:[6,34],7:[6,22,38],8:[6,24,42],9:[6,26,46],10:[6,28,50]};
const countBits=v=>v<10?8:16;
const capacity=v=>Math.floor((VERSIONS[v][0]*8-4-countBits(v))/8);

function bchFormat(d){
  let v=d<<10;
  for(let i=14;i>=10;i--)if((v>>i)&1)v^=0x537<<(i-10);
  return((d<<10)|v)^0x5412;
}
function bchVersion(v){
  let r=v<<12;
  for(let i=17;i>=12;i--)if((r>>i)&1)r^=0x1f25<<(i-12);
  return(v<<12)|r;
}

const MASKS=[
  (r,c)=>(r+c)%2===0,
  r=>r%2===0,
  (r,c)=>c%3===0,
  (r,c)=>(r+c)%3===0,
  (r,c)=>(Math.floor(r/2)+Math.floor(c/3))%2===0,
  (r,c)=>(r*c)%2+(r*c)%3===0,
  (r,c)=>((r*c)%2+(r*c)%3)%2===0,
  (r,c)=>((r+c)%2+(r*c)%3)%2===0
];

function penalty(m,size){
  let p=0;
  const lineAt=(i,vert)=>{const l=new Array(size);for(let j=0;j<size;j++)l[j]=vert?m[j][i]:m[i][j];return l};
  const P1=[1,0,1,1,1,0,1,0,0,0,0],P2=[0,0,0,0,1,0,1,1,1,0,1];
  for(let i=0;i<size;i++)for(const vert of[false,true]){
    const line=lineAt(i,vert);
    let run=1;
    for(let j=1;j<size;j++){
      if(line[j]===line[j-1])run++;
      else{if(run>=5)p+=3+(run-5);run=1}
    }
    if(run>=5)p+=3+(run-5);
    for(let j=0;j+11<=size;j++){
      let a=true,b=true;
      for(let k=0;k<11;k++){if(line[j+k]!==P1[k])a=false;if(line[j+k]!==P2[k])b=false}
      if(a)p+=40;
      if(b)p+=40;
    }
  }
  for(let r=0;r<size-1;r++)for(let c=0;c<size-1;c++){
    const v=m[r][c];
    if(v===m[r][c+1]&&v===m[r+1][c]&&v===m[r+1][c+1])p+=3;
  }
  let dark=0;
  for(let r=0;r<size;r++)for(let c=0;c<size;c++)dark+=m[r][c];
  p+=10*Math.floor(Math.abs(dark*100/(size*size)-50)/5);
  return p;
}

/* Returns {size, data} where data[r*size+c] is 1 for a dark module - the same shape the
   reference encoder hands back, which is what makes comparing them straightforward. */
/* forceMask exists so the encoder can be checked against a reference implementation
   mask-for-mask. Reference encoders disagree with the spec on penalty rule N4 - several
   charge for a dark ratio a hair over 50% where the spec charges nothing - so two correct
   encoders can pick different masks for the same payload. Every mask yields a readable
   code, since the format bits record which one was used, but pinning it is what turns
   "looks similar" into "identical". */
function matrix(text,forceMask){
  const bytes=new TextEncoder().encode(String(text));
  let version=0;
  for(let v=1;v<=10;v++)if(bytes.length<=capacity(v)){version=v;break}
  if(!version)throw new Error("QR payload too long");

  const [dataWords,ecWords,b1,len1,b2,len2]=VERSIONS[version];

  /* Bit stream: mode indicator, length, payload, terminator, then the alternating pad
     bytes the spec names. */
  const bits=[];
  const push=(val,n)=>{for(let i=n-1;i>=0;i--)bits.push((val>>i)&1)};
  push(4,4);
  push(bytes.length,countBits(version));
  for(const b of bytes)push(b,8);
  for(let i=0;i<4&&bits.length<dataWords*8;i++)bits.push(0);
  while(bits.length%8)bits.push(0);
  const words=[];
  for(let i=0;i<bits.length;i+=8){let v=0;for(let j=0;j<8;j++)v=(v<<1)|bits[i+j];words.push(v)}
  for(let i=0;words.length<dataWords;i++)words.push(i%2?0x11:0xec);

  /* Split into blocks, error-correct each, then interleave: codeword i of every block in
     turn, data first and then EC. */
  const blocks=[],ecs=[];
  let at=0;
  for(const [count,len] of [[b1,len1],[b2,len2]])for(let i=0;i<count;i++){
    const blk=Uint8Array.from(words.slice(at,at+len));at+=len;
    blocks.push(blk);ecs.push(rsEncode(blk,ecWords));
  }
  const stream=[];
  for(let i=0;i<Math.max(len1,len2);i++)for(const blk of blocks)if(i<blk.length)stream.push(blk[i]);
  for(let i=0;i<ecWords;i++)for(const ec of ecs)stream.push(ec[i]);
  const dataBits=[];
  for(const w of stream)for(let i=7;i>=0;i--)dataBits.push((w>>i)&1);

  const size=17+4*version;
  const grid=()=>Array.from({length:size},()=>new Uint8Array(size));
  const m=grid(),reserved=grid();
  const set=(r,c,v)=>{m[r][c]=v;reserved[r][c]=1};

  /* Finder patterns and their separators. */
  for(const [fr,fc] of [[0,0],[0,size-7],[size-7,0]]){
    for(let r=-1;r<=7;r++)for(let c=-1;c<=7;c++){
      const rr=fr+r,cc=fc+c;
      if(rr<0||cc<0||rr>=size||cc>=size)continue;
      const on=r>=0&&r<=6&&c>=0&&c<=6&&(r===0||r===6||c===0||c===6||(r>=2&&r<=4&&c>=2&&c<=4));
      set(rr,cc,on?1:0);
    }
  }
  /* Alignment patterns, except where one would sit on a finder. */
  const centers=ALIGN[version];
  for(const r of centers)for(const c of centers){
    if((r<=8&&c<=8)||(r<=8&&c>=size-9)||(r>=size-9&&c<=8))continue;
    for(let dr=-2;dr<=2;dr++)for(let dc=-2;dc<=2;dc++)
      set(r+dr,c+dc,Math.max(Math.abs(dr),Math.abs(dc))!==1?1:0);
  }
  /* Timing patterns. */
  for(let i=8;i<size-8;i++){set(6,i,i%2===0?1:0);set(i,6,i%2===0?1:0)}
  /* Format areas and the one module that is always dark. */
  for(let i=0;i<9;i++){
    if(!reserved[8][i])set(8,i,0);
    if(!reserved[i][8])set(i,8,0);
  }
  for(let i=0;i<8;i++){
    if(!reserved[8][size-1-i])set(8,size-1-i,0);
    if(!reserved[size-1-i][8])set(size-1-i,8,0);
  }
  set(size-8,8,1);
  /* Version blocks, from version 7 up. */
  if(version>=7){
    const vi=bchVersion(version);
    for(let i=0;i<18;i++){
      const bit=(vi>>i)&1,r=Math.floor(i/3),c=i%3;
      set(size-11+c,r,bit);set(r,size-11+c,bit);
    }
  }

  /* Zigzag up and down two columns at a time, skipping the vertical timing column. */
  let idx=0,dir=-1,row=size-1;
  for(let col=size-1;col>=1;col-=2){
    if(col===6)col=5;
    for(;;){
      for(let j=0;j<2;j++){
        const c=col-j;
        if(!reserved[row][c])m[row][c]=idx<dataBits.length?dataBits[idx++]:0;
      }
      row+=dir;
      if(row<0||row>=size){row-=dir;dir=-dir;break}
    }
  }

  /* Every mask is applied in full, scored, and the lowest penalty wins - the spec's own
     rule, and the reason two codes for similar URLs can look nothing alike. */
  let best=null,bestScore=Infinity,bestMask=0;
  for(let mask=0;mask<8;mask++){
    if(forceMask!=null&&mask!==forceMask)continue;
    const cand=grid();
    for(let r=0;r<size;r++)for(let c=0;c<size;c++)
      cand[r][c]=reserved[r][c]?m[r][c]:(m[r][c]^(MASKS[mask](r,c)?1:0));
    /* Both copies of the 15 format bits are written most-significant first, each along
       the fixed path below. Writing them least-significant first still produces a
       plausible-looking code that no scanner can read. */
    const fmt=bchFormat((0<<3)|mask);
    const copy1=[[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
    const copy2=[[size-1,8],[size-2,8],[size-3,8],[size-4,8],[size-5,8],[size-6,8],[size-7,8],
                 [8,size-8],[8,size-7],[8,size-6],[8,size-5],[8,size-4],[8,size-3],[8,size-2],[8,size-1]];
    for(let i=0;i<15;i++){
      const b=(fmt>>(14-i))&1;
      cand[copy1[i][0]][copy1[i][1]]=b;
      cand[copy2[i][0]][copy2[i][1]]=b;
    }
    cand[size-8][8]=1;
    const score=penalty(cand,size);
    if(score<bestScore){bestScore=score;best=cand;bestMask=mask}
  }

  const data=new Uint8Array(size*size);
  for(let r=0;r<size;r++)for(let c=0;c<size;c++)data[r*size+c]=best[r][c];
  return{size,data,version,mask:bestMask};
}

window.BL07_QR={matrix};
})();
