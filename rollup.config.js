import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from "rollup-plugin-terser";
import pkg from './package.json';

export default [
	{
		input: 'src/js/egodesign.form.js',
		output: {
            name: 'egodesign.form',
			file: pkg.browser,
			format: 'umd',
            exports: 'default'
		},
		plugins: [
            terser(),
			resolve(),
			commonjs()
		]
	},
	{
		input: 'src/js/egodesign.form.js',
		external: ['ms'],
        plugins: [
            terser()
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