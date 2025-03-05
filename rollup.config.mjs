import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from "@rollup/plugin-terser";
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' with { type: 'json' };

export default [
    {
        input: 'src/egodesign.form.ts',
        output: {
            name: 'egodesign.form',
            file: pkg.browser,
            format: 'umd',
            exports: 'default'
        },
        plugins: [
            terser(),
            resolve(),
            commonjs(),
            typescript({
                tsconfig: "./tsconfig.json",
                compilerOptions: {
                    target: "ES2020" // Or a more modern target
                }
            })
        ]
    },
    {
        input: 'src/egodesign.form.ts',
        external: ['ms'],
        plugins: [
            terser(),
            typescript({
                tsconfig: "./tsconfig.json",
                compilerOptions: {
                    target: "ES2020" // Or a more modern target
                }
            })
        ],
        output: [
            {
                name: 'egodesign.form',
                file: pkg.main,
                format: 'cjs',
                exports: 'default'
            },
            {
                name: 'egodesign.form',
                file: pkg.module,
                format: 'es',
                exports: 'default'
            }
        ]
    }
];